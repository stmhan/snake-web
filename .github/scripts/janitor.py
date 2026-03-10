#!/usr/bin/env python3
"""Agent 3: Fix review feedback on pull requests (translated from janitor.ps1).

Fetches the latest review comments from a PR, invokes Claude CLI
to address the feedback, then commits and pushes the fixes.
"""

import json
import subprocess
import sys

from claude_cli import invoke_claude_cli
from agent_loader import get_agent_content
from config_loader import get_agent_config
from logger import get_logger
from prompt_loader import get_prompt_template

log = get_logger("janitor")


def run_git(*args) -> subprocess.CompletedProcess:
    return subprocess.run(["git"] + list(args), capture_output=True, text=True, encoding="utf-8")


def run_gh(*args) -> subprocess.CompletedProcess:
    return subprocess.run(["gh"] + list(args), capture_output=True, text=True, encoding="utf-8")


def _add_iteration_label(pr_number: int, iteration: int) -> None:
    """Add a janitor iteration label to the PR, creating it if needed."""
    label_name = f"janitor-iteration-{iteration}"
    run_gh("label", "create", label_name, "--description",
           "Janitor iteration tracker", "--color", "ededed")
    run_gh("pr", "edit", str(pr_number), "--add-label", label_name)


def main(pr_number: int) -> int:
    """Fix review feedback on a pull request.

    Args:
        pr_number: The pull request number to fix.

    Returns:
        Exit code (0 for success, 1 for failure).
    """
    # --- Check if PR is still open ---
    result = run_gh("pr", "view", str(pr_number), "--json", "state")
    try:
        state = json.loads(result.stdout).get("state", "")
    except (json.JSONDecodeError, ValueError):
        state = ""
    if state != "OPEN":
        log.info("PR #%d is %s. Skipping fixes.", pr_number, state or "unknown")
        return 0

    # --- Configuration ---
    cfg = get_agent_config("janitor")
    max_retries = cfg["max_retries"]
    stack = cfg["stack"]
    test_command = cfg["test_command"]
    max_turns = cfg["max_turns"]

    # --- Load agent content ---
    agent_content = get_agent_content(
        "janitor",
        max_file_chars=cfg["agent_max_file_kb"] * 1024,
        max_total_chars=cfg["agent_max_total_kb"] * 1024,
    )

    # --- Determine iteration count from PR labels ---
    log.info("Checking iteration count for PR #%d...", pr_number)
    result = run_gh("pr", "view", str(pr_number), "--json", "labels")
    try:
        labels_data = json.loads(result.stdout) if result.stdout else {}
    except (json.JSONDecodeError, ValueError):
        labels_data = {}
    labels = [l["name"] for l in labels_data.get("labels", [])]
    iteration_count = sum(1 for l in labels if l.startswith("janitor-iteration-"))

    if iteration_count >= max_retries:
        log.warning("Max retries (%d) reached for PR #%d. Exiting.", max_retries, pr_number)
        run_gh(
            "pr", "comment", str(pr_number), "--body",
            f"Janitor가 최대 수정 시도 횟수({max_retries}회)에 도달했습니다. "
            f"수동 개입이 필요합니다.\n\n---\nclaude-agent-swarm (janitor)에 의해 생성됨",
        )
        return 0

    current_iteration = iteration_count + 1
    log.info("=== JANITOR START === Fixing PR #%d (iteration %d of %d)", pr_number, current_iteration, max_retries)

    # --- Fetch latest review feedback ---
    log.info("Fetching review feedback for PR #%d...", pr_number)
    result = run_gh("pr", "view", str(pr_number), "--json", "reviews")
    if result.returncode != 0:
        log.error("Failed to fetch PR reviews: %s", result.stderr or result.stdout)
        return 1

    try:
        reviews_data = json.loads(result.stdout)
    except (json.JSONDecodeError, ValueError) as e:
        log.error("Failed to parse PR reviews: %s", e)
        return 1
    reviews = reviews_data.get("reviews", [])

    # Find latest CHANGES_REQUESTED review, or APPROVED review with suggestions
    changes_requested = [r for r in reviews if r.get("state") == "CHANGES_REQUESTED"]
    approved_with_suggestions = [
        r for r in reviews
        if r.get("state") == "APPROVED" and "제안]" in r.get("body", "")
    ]

    # Prefer CHANGES_REQUESTED, fall back to approved suggestions
    actionable = changes_requested or approved_with_suggestions
    actionable.sort(key=lambda r: r.get("submittedAt", ""), reverse=True)

    feedback_body = ""
    inline_comments = ""

    if actionable:
        latest_review = actionable[0]
        feedback_body = latest_review.get("body", "")

        # Also fetch inline review comments
        result = run_gh("pr", "view", str(pr_number), "--json", "reviewComments", "--jq", ".reviewComments[].body")
        inline_comments = result.stdout if result.returncode == 0 else ""

        if not changes_requested:
            log.info("No changes requested, but found suggestions in approved review.")
    else:
        # Fallback: check PR comments from the critic bot (posted when review API fails)
        log.info("No formal review found. Checking PR comments for critic feedback...")
        result = run_gh("pr", "view", str(pr_number), "--json", "comments")
        try:
            comments_data = json.loads(result.stdout) if result.stdout else {}
        except (json.JSONDecodeError, ValueError):
            comments_data = {}
        comments = comments_data.get("comments", [])

        # Find latest critic comment with "CHANGES REQUESTED"
        critic_comments = [
            c for c in comments
            if "CHANGES REQUESTED" in c.get("body", "")
            and "claude-agent-swarm" in c.get("body", "")
        ]
        critic_comments.sort(key=lambda c: c.get("createdAt", ""), reverse=True)

        if critic_comments:
            feedback_body = critic_comments[0].get("body", "")
            log.info("Found critic feedback in PR comment.")
        else:
            log.info("No changes-requested feedback found for PR #%d.", pr_number)
            run_gh(
                "pr", "comment", str(pr_number), "--body",
                f"PR #{pr_number}에 대한 리뷰 피드백을 찾을 수 없습니다.\n\n"
                f"---\nclaude-agent-swarm (janitor)에 의해 생성됨",
            )
            return 0

    # --- Build prompt ---
    if test_command:
        test_instructions = f"Run `{test_command}` to make sure existing tests still pass after your changes."
    else:
        test_instructions = "Ensure existing tests still pass after your changes."

    prompt = get_prompt_template(
        agent_name="janitor",
        tokens={
            "STACK": stack,
            "FEEDBACK_BODY": feedback_body,
            "INLINE_COMMENTS": inline_comments,
            "TEST_INSTRUCTIONS": test_instructions,
        },
        agent_content=agent_content,
    )

    # --- Invoke Claude ---
    log.info("Invoking Claude CLI to fix review feedback (iteration %d)...", current_iteration)

    # Capture HEAD before Claude runs to detect direct commits
    head_before = run_git("rev-parse", "HEAD").stdout.strip()

    claude_result = invoke_claude_cli(
        prompt,
        extra_args=["--dangerously-skip-permissions", "--max-turns", str(max_turns)],
    )

    log.debug("Claude output:\n%s", claude_result["output"])

    if claude_result["exit_code"] != 0:
        log.error("Claude CLI exited with code %d", claude_result["exit_code"])
        return 1

    # --- Stage and commit (only if there are uncommitted changes) ---
    head_after = run_git("rev-parse", "HEAD").stdout.strip()
    claude_committed = head_before != head_after

    has_changes = run_git("status", "--porcelain")
    if has_changes.stdout.strip():
        log.info("Staging and committing fixes...")
        result = run_git("add", "-A", "--", ":!__pycache__/", ":!*.pyc", ":!logs/")
        if result.returncode != 0:
            log.error("Failed to stage changes")
            return 1

        commit_message = (
            f"fix: PR #{pr_number} 리뷰 피드백 반영 "
            f"({current_iteration}차 수정) [skip-review]"
        )
        result = run_git("commit", "-m", commit_message)
        if result.returncode != 0:
            log.error("Failed to commit changes")
            return 1
    elif claude_committed:
        log.info("No uncommitted changes (Claude committed directly).")
    else:
        log.info("No changes were made by Claude. Posting comment and exiting.")
        _add_iteration_label(pr_number, current_iteration)
        run_gh(
            "pr", "comment", str(pr_number), "--body",
            f"요청된 피드백에 대해 수정할 변경 사항을 결정할 수 없습니다 "
            f"({current_iteration}차 시도).\n\n"
            f"---\nclaude-agent-swarm (janitor)에 의해 생성됨",
        )
        return 0

    # --- Push (force to handle case where Claude already pushed) ---
    log.info("Pushing fixes...")
    result = run_git("push", "--force-with-lease")
    if result.returncode != 0:
        log.error("Failed to push fixes")
        return 1

    # --- Post iteration comment and label ---
    _add_iteration_label(pr_number, current_iteration)
    run_gh(
        "pr", "comment", str(pr_number), "--body",
        f"리뷰 피드백을 반영했습니다 "
        f"({current_iteration}/{max_retries}차 수정).\n\n"
        f"---\nclaude-agent-swarm (janitor)에 의해 생성됨",
    )

    log.info("=== JANITOR COMPLETE === PR #%d - Fixes pushed (iteration %d)", pr_number, current_iteration)
    return 0


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Janitor agent")
    parser.add_argument("pr_number", type=int)
    args = parser.parse_args()
    sys.exit(main(args.pr_number))
