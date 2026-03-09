"""Agent content loader for agent scripts."""

import math
import os
import re

from logger import get_logger

log = get_logger("agent_loader")


_VALID_AGENTS = {"architect", "critic", "janitor"}


def _read_agent_files(
    dir_path: str,
    section_label: str,
    total_size: list,
    max_file_chars: int = 10 * 1024,
    max_total_chars: int = 50 * 1024,
) -> str | None:
    """Read .md files from a directory with size limits.

    Args:
        dir_path: Path to the directory to read.
        section_label: Label for the section header.
        total_size: Single-element list used as mutable reference for total char count.
        max_file_chars: Max characters per file before truncation.
        max_total_chars: Max total characters budget.

    Returns:
        Formatted section string or None if no content found.
    """
    if not os.path.isdir(dir_path):
        return None

    md_files = sorted(
        [f for f in os.listdir(dir_path) if f.endswith(".md") and os.path.isfile(os.path.join(dir_path, f))],
    )

    if not md_files:
        return None

    file_contents = []
    skipped_files = []

    for filename in md_files:
        if total_size[0] >= max_total_chars:
            skipped_files.append(filename)
            continue

        filepath = os.path.join(dir_path, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except OSError:
            continue

        if not content or not content.strip():
            continue

        if len(content) > max_file_chars:
            limit_kb = math.floor(max_file_chars / 1024)
            log.warning("%s exceeds %dKB, truncating.", filename, limit_kb)
            content = content[:max_file_chars]
            content += f"\n\n... [truncated at {limit_kb}KB] ..."

        if (total_size[0] + len(content)) > max_total_chars:
            remaining = max_total_chars - total_size[0]
            if remaining > 0:
                content = content[:remaining]
                content += "\n\n... [truncated - budget exceeded] ..."
                total_size[0] = max_total_chars
            else:
                skipped_files.append(filename)
                continue
        else:
            total_size[0] += len(content)

        file_contents.append(content)

    if skipped_files:
        log.warning(
            ".agent-swarm budget exceeded. Skipped %d file(s) from %s: %s",
            len(skipped_files), section_label, ", ".join(skipped_files),
        )

    if not file_contents:
        return None

    header = f"## {section_label}"
    return f"{header}\n\n" + "\n\n---\n\n".join(file_contents)


def get_agent_content(
    agent_name: str,
    project_root: str = None,
    max_file_chars: int = 10 * 1024,
    max_total_chars: int = 50 * 1024,
) -> str:
    """Load .agent-swarm/agents content for an agent.

    Args:
        agent_name: One of 'architect', 'critic', 'janitor'.
        project_root: Root directory of the project. Defaults to cwd.
        max_file_chars: Max characters per file before truncation.
        max_total_chars: Max total characters budget.

    Returns:
        Combined content string, or empty string if nothing found.

    Raises:
        ValueError: If agent_name is invalid or contains path traversal.
    """
    if agent_name not in _VALID_AGENTS:
        raise ValueError(f"Invalid agent name: {agent_name}")

    if re.search(r"\.\.|[/\\]", agent_name):
        raise ValueError("Invalid agent name: path traversal detected")

    if project_root is None:
        project_root = os.getcwd()

    agents_root = os.path.join(project_root, ".agent-swarm", "agents")

    if not os.path.isdir(agents_root):
        log.info("No .agent-swarm/agents directory found. Skipping custom rules/skills.")
        return ""

    sections = []
    total_size = [0]

    load_order = [
        {"label": "Shared Rules", "path": os.path.join(agents_root, "shared", "rules")},
        {"label": f"Agent Rules ({agent_name})", "path": os.path.join(agents_root, agent_name, "rules")},
        {"label": "Shared Skills", "path": os.path.join(agents_root, "shared", "skills")},
        {"label": f"Agent Skills ({agent_name})", "path": os.path.join(agents_root, agent_name, "skills")},
    ]

    for entry in load_order:
        result = _read_agent_files(
            dir_path=entry["path"],
            section_label=entry["label"],
            total_size=total_size,
            max_file_chars=max_file_chars,
            max_total_chars=max_total_chars,
        )
        if result:
            sections.append(result)

    if not sections:
        return ""

    return "\n\n".join(sections)
