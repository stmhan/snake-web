#!/usr/bin/env python3
"""Agent 1: Implement features from GitHub issues (translated from architect.ps1).

Creates a feature branch, invokes Claude CLI to implement the issue,
commits the changes, pushes the branch, and opens a pull request.
"""

import re
import subprocess
import sys

from claude_cli import invoke_claude_cli
from agent_loader import get_agent_content
from config_loader import get_agent_config
from logger import get_logger
from prompt_loader import get_prompt_template

log = get_logger("architect")


def run_git(*args) -> subprocess.CompletedProcess:
    return subprocess.run(["git"] + list(args), capture_output=True, text=True, encoding="utf-8")


def run_gh(*args) -> subprocess.CompletedProcess:
    return subprocess.run(["gh"] + list(args), capture_output=True, text=True, encoding="utf-8")


def main(issue_number: int, issue_title: str) -> int:
    """Implement a GitHub issue.

    Args:
        issue_number: The GitHub issue number.
        issue_title: The title of the GitHub issue.

    Returns:
        Exit code (0 for success, 1 for failure).
    """
    # --- Configuration ---
    cfg = get_agent_config("architect")
    if not cfg["config_found"]:
        log.warning("No agent-config.json found, using defaults.")

    branch_prefix = cfg["branch_prefix"]
    commit_prefix = cfg["commit_prefix"]
    stack = cfg["stack"]
    test_command = cfg["test_command"]
    lint_command = cfg["lint_command"]
    max_turns = cfg["max_turns"]

    # --- Load agent content ---
    agent_content = get_agent_content(
        "architect",
        max_file_chars=cfg["agent_max_file_kb"] * 1024,
        max_total_chars=cfg["agent_max_total_kb"] * 1024,
    )

    # --- Fetch issue body ---
    log.info("Fetching issue #%d details...", issue_number)
    result = run_gh("issue", "view", str(issue_number), "--json", "body", "--jq", ".body")
    if result.returncode != 0:
        log.error("Failed to fetch issue #%d: %s", issue_number, result.stderr or result.stdout)
        return 1

    issue_body = result.stdout

    # --- Mark issue as in-progress ---
    log.info("Marking issue #%d as in-progress...", issue_number)
    run_gh("issue", "edit", str(issue_number), "--add-label", "agent:in-progress")
    run_gh("issue", "comment", str(issue_number), "--body", "Architect is working on this issue...")

    # --- Create branch ---
    branch_name = f"{branch_prefix}{issue_number}"
    safe_branch = re.sub(r"[^a-zA-Z0-9\-/]", "-", branch_name)

    log.info("Creating branch: %s", safe_branch)
    result = run_git("checkout", "-b", safe_branch)
    if result.returncode != 0:
        log.error("Failed to create branch %s", safe_branch)
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 1

    # --- Build prompt ---
    if test_command:
        test_instructions = f"Run `{test_command}` to verify your changes pass. Write tests first (TDD)."
    else:
        test_instructions = "Write tests for any new functionality if a test framework is available."

    lint_instructions = f"Run `{lint_command}` and fix any lint errors before finishing." if lint_command else ""

    prompt = get_prompt_template(
        agent_name="architect",
        tokens={
            "ISSUE_NUMBER": str(issue_number),
            "ISSUE_TITLE": issue_title,
            "ISSUE_BODY": issue_body,
            "STACK": stack,
            "TEST_INSTRUCTIONS": test_instructions,
            "LINT_INSTRUCTIONS": lint_instructions,
        },
        agent_content=agent_content,
    )

    # --- Invoke Claude ---
    log.info("Invoking Claude CLI to implement issue #%d...", issue_number)
    claude_result = invoke_claude_cli(
        prompt,
        extra_args=["--dangerously-skip-permissions", "--max-turns", str(max_turns)],
    )

    log.debug("Claude output:\n%s", claude_result["output"])

    if claude_result["exit_code"] != 0:
        log.error("Claude CLI exited with code %d", claude_result["exit_code"])
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 1

    # --- Stage and commit ---
    has_changes = run_git("status", "--porcelain")
    if not has_changes.stdout.strip():
        log.info("No changes were made by Claude. Exiting.")
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 0

    log.info("Staging and committing changes...")
    result = run_git("add", "-A")
    if result.returncode != 0:
        log.error("Failed to stage changes")
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 1

    commit_message = f"{commit_prefix}: implement #{issue_number} {issue_title}"
    result = run_git("commit", "-m", commit_message)
    if result.returncode != 0:
        log.error("Failed to commit changes")
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 1

    # --- Push and create PR ---
    log.info("Pushing branch %s...", safe_branch)
    result = run_git("push", "-u", "origin", safe_branch)
    if result.returncode != 0:
        log.error("Failed to push branch")
        run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
        return 1

    pr_body = (
        f"## Summary\n"
        f"Automated implementation of #{issue_number}.\n\n"
        f"## Issue\n"
        f"Closes #{issue_number}\n\n"
        f"## Changes\n"
        f"See commit history for details.\n\n"
        f"---\n"
        f"Generated by claude-agent-swarm (architect)"
    )

    log.info("Creating pull request...")
    result = run_gh(
        "pr", "create",
        "--title", f"{commit_prefix}: implement #{issue_number} {issue_title}",
        "--body", pr_body,
        "--base", "main",
        "--head", safe_branch,
    )

    if result.returncode != 0:
        # gh pr create exits 1 if a PR already exists for the branch.
        # Extract the URL from the error message and treat it as success.
        error_msg = result.stderr or result.stdout
        if "already exists" in error_msg:
            import re as _re
            url_match = _re.search(r"(https://github\.com/\S+)", error_msg)
            pr_url = url_match.group(1) if url_match else "(existing PR)"
            log.info("PR already exists: %s", pr_url)
        else:
            log.error("Failed to create PR: %s", error_msg)
            run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
            return 1
    else:
        pr_url = result.stdout.strip()
        log.info("Pull request created: %s", pr_url)
    log.info("=== ARCHITECT COMPLETE === PR: %s", pr_url)
    run_gh("issue", "edit", str(issue_number), "--remove-label", "agent:in-progress")
    return 0


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Architect agent")
    parser.add_argument("issue_number", type=int)
    parser.add_argument("issue_title", type=str)
    args = parser.parse_args()
    sys.exit(main(args.issue_number, args.issue_title))
