"""Prompt template loader for agent scripts (translated from PromptLoader.psm1)."""

import os
import re
import warnings
from pathlib import Path


def get_prompt_template(
    agent_name: str,
    tokens: dict,
    agent_content: str = "",
    template_directory: str = None,
) -> str:
    """Load a prompt template and replace tokens.

    Args:
        agent_name: One of 'architect', 'critic', 'janitor'.
        tokens: Dict of TOKEN_NAME -> replacement value.
        agent_content: Optional agent content to inject.
        template_directory: Path to templates dir. Defaults to prompts/ next to this file.

    Returns:
        The fully-rendered prompt string.

    Raises:
        FileNotFoundError: If the template file doesn't exist.
    """
    if not template_directory:
        template_directory = str(Path(__file__).resolve().parent / "prompts")

    template_path = os.path.join(template_directory, f"{agent_name}.md")

    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Prompt template not found: {template_path}")

    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # Handle agent section: inject guidelines or remove placeholder
    if agent_content:
        template = template.replace(
            "{{AGENT_SECTION}}",
            f"\n## Project-Specific Guidelines\n\n{agent_content}",
        )
    else:
        template = template.replace("{{AGENT_SECTION}}", "")

    # Replace all token placeholders (literal string replacement, not regex)
    for key, value in tokens.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))

    # Warn about any unreplaced tokens
    unreplaced = re.findall(r"\{\{[A-Z_]+\}\}", template)
    if unreplaced:
        warnings.warn(
            f"Unreplaced tokens in {agent_name} template: {', '.join(unreplaced)}",
            UserWarning,
            stacklevel=2,
        )

    return template
