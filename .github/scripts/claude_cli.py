"""Claude CLI wrapper (extracted from CodeBotLoader.psm1 Invoke-ClaudeCli)."""

import subprocess

from logger import get_logger

log = get_logger("claude_cli")


def invoke_claude_cli(prompt: str, extra_args: list = None) -> dict:
    """Invoke Claude CLI with a prompt via stdin.

    Cross-platform: uses subprocess.run with stdin pipe (no temp files needed).

    Args:
        prompt: The prompt text to send to Claude.
        extra_args: Additional CLI arguments (e.g. ['--dangerously-skip-permissions']).

    Returns:
        Dict with 'exit_code' (int) and 'output' (str).
    """
    if extra_args is None:
        extra_args = []

    cmd = ["claude", "-p", "--output-format", "text"] + extra_args

    try:
        proc = subprocess.run(
            cmd,
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

        if proc.stderr:
            log.warning("Claude stderr: %s", proc.stderr)

        return {
            "exit_code": proc.returncode,
            "output": proc.stdout,
        }
    except OSError as e:
        log.error("Claude invocation error: %s", e)
        return {
            "exit_code": 1,
            "output": "",
        }
