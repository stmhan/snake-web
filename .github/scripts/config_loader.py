"""Configuration loader for agent scripts (translated from ConfigLoader.psm1)."""

import json
import os
from pathlib import Path


_VALID_AGENTS = {"architect", "critic", "janitor"}

_DEFAULT_REVIEW_CRITERIA = [
    "Tests exist for new code",
    "No hardcoded secrets",
    "Proper error handling",
    "Code is readable and maintainable",
]


_VALID_TOP_LEVEL_KEYS = {"$schema", "project", "agents", "limits", "logging"}
_VALID_PROJECT_KEYS = {"name", "stack", "testCommand", "lintCommand"}
_VALID_ARCHITECT_KEYS = {"branchPrefix", "commitPrefix", "maxTurns"}
_VALID_CRITIC_KEYS = {"reviewCriteria", "maxDiffKB"}
_VALID_JANITOR_KEYS = {"maxRetries", "maxTurns"}
_VALID_AGENT_SECTIONS = {"architect", "critic", "janitor"}
_VALID_LIMITS_KEYS = {"agentMaxFileKB", "agentMaxTotalKB"}
_VALID_LOGGING_KEYS = {"level", "fileOutput", "logDir"}
_VALID_LOG_LEVELS = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}

_POSITIVE_INT_FIELDS = {
    ("agents", "architect", "maxTurns"),
    ("agents", "critic", "maxDiffKB"),
    ("agents", "janitor", "maxRetries"),
    ("agents", "janitor", "maxTurns"),
    ("limits", "agentMaxFileKB"),
    ("limits", "agentMaxTotalKB"),
}


def validate_config(config: dict) -> list:
    """Validate config dict and return a list of warning strings.

    Never raises. Returns an empty list for a valid config.
    """
    warnings = []

    if not isinstance(config, dict):
        warnings.append("Config is not a JSON object.")
        return warnings

    for key in config:
        if key not in _VALID_TOP_LEVEL_KEYS:
            warnings.append(f"Unknown top-level key '{key}', will be ignored.")

    project = config.get("project")
    if project is not None:
        if not isinstance(project, dict):
            warnings.append("'project' should be an object.")
        else:
            for key in project:
                if key not in _VALID_PROJECT_KEYS:
                    warnings.append(f"Unknown key 'project.{key}', will be ignored.")

    agents = config.get("agents")
    if agents is not None:
        if not isinstance(agents, dict):
            warnings.append("'agents' should be an object.")
        else:
            for section_name in agents:
                if section_name not in _VALID_AGENT_SECTIONS:
                    warnings.append(f"Unknown key 'agents.{section_name}', will be ignored.")
            _validate_agent_section(agents, "architect", _VALID_ARCHITECT_KEYS, warnings)
            _validate_agent_section(agents, "critic", _VALID_CRITIC_KEYS, warnings)
            _validate_agent_section(agents, "janitor", _VALID_JANITOR_KEYS, warnings)
            critic = agents.get("critic", {})
            if isinstance(critic, dict):
                rc = critic.get("reviewCriteria")
                if rc is not None and not isinstance(rc, list):
                    warnings.append("'agents.critic.reviewCriteria' should be an array.")

    limits = config.get("limits")
    if limits is not None:
        if not isinstance(limits, dict):
            warnings.append("'limits' should be an object.")
        else:
            for key in limits:
                if key not in _VALID_LIMITS_KEYS:
                    warnings.append(f"Unknown key 'limits.{key}', will be ignored.")

    logging_cfg = config.get("logging")
    if logging_cfg is not None:
        if not isinstance(logging_cfg, dict):
            warnings.append("'logging' should be an object.")
        else:
            for key in logging_cfg:
                if key not in _VALID_LOGGING_KEYS:
                    warnings.append(f"Unknown key 'logging.{key}', will be ignored.")
            level = logging_cfg.get("level")
            if level is not None and (not isinstance(level, str) or level.upper() not in _VALID_LOG_LEVELS):
                warnings.append(f"'logging.level' has invalid value '{level}'. Valid: {', '.join(sorted(_VALID_LOG_LEVELS))}.")
            fo = logging_cfg.get("fileOutput")
            if fo is not None and not isinstance(fo, bool):
                warnings.append("'logging.fileOutput' should be a boolean.")

    for path in _POSITIVE_INT_FIELDS:
        value = config
        full_path = ".".join(path)
        for key in path:
            if not isinstance(value, dict):
                value = None
                break
            value = value.get(key)
        if value is not None:
            if not isinstance(value, int) or isinstance(value, bool):
                warnings.append(f"'{full_path}' should be a positive integer.")
            elif value < 1:
                warnings.append(f"'{full_path}' should be >= 1, got {value}.")

    return warnings


def _validate_agent_section(agents: dict, name: str, valid_keys: set, warnings: list) -> None:
    section = agents.get(name)
    if section is not None:
        if not isinstance(section, dict):
            warnings.append(f"'agents.{name}' should be an object.")
        else:
            for key in section:
                if key not in valid_keys:
                    warnings.append(f"Unknown key 'agents.{name}.{key}', will be ignored.")


def get_agent_config(agent_name: str, config_path: str = None) -> dict:
    """Load agent configuration, falling back to defaults when file is missing.

    Args:
        agent_name: One of 'architect', 'critic', 'janitor'.
        config_path: Path to config.json. Defaults to .agent-swarm/config.json
                     relative to the project root.

    Returns:
        Dict with all config values plus a 'config_found' flag.
    """
    if agent_name not in _VALID_AGENTS:
        raise ValueError(f"Invalid agent name: {agent_name}")

    if not config_path:
        scripts_dir = Path(__file__).resolve().parent
        config_path = str(scripts_dir / ".." / ".." / ".agent-swarm" / "config.json")

    config = None
    config_found = False

    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        config_found = True

    if config is not None:
        from logger import get_logger
        _log = get_logger("config_loader")
        config_warnings = validate_config(config)
        for w in config_warnings:
            _log.warning("%s", w)

    def _get(obj, *keys, default=None):
        """Safely traverse nested dicts."""
        current = obj
        for key in keys:
            if current is None or not isinstance(current, dict):
                return default
            current = current.get(key)
        return current if current is not None else default

    stack = _get(config, "project", "stack", default="unknown stack")
    test_command = _get(config, "project", "testCommand", default="")
    lint_command = _get(config, "project", "lintCommand", default="")
    branch_prefix = _get(config, "agents", "architect", "branchPrefix", default="feat/issue-")
    commit_prefix = _get(config, "agents", "architect", "commitPrefix", default="feat")
    max_retries = _get(config, "agents", "janitor", "maxRetries", default=3)

    if agent_name == "architect":
        max_turns = _get(config, "agents", "architect", "maxTurns", default=100)
    elif agent_name == "janitor":
        max_turns = _get(config, "agents", "janitor", "maxTurns", default=30)
    else:
        max_turns = None

    max_diff_kb = _get(config, "agents", "critic", "maxDiffKB", default=100)
    agent_max_file_kb = _get(config, "limits", "agentMaxFileKB", default=10)
    agent_max_total_kb = _get(config, "limits", "agentMaxTotalKB", default=50)

    review_criteria = _get(config, "agents", "critic", "reviewCriteria", default=None)
    if review_criteria is None:
        review_criteria = list(_DEFAULT_REVIEW_CRITERIA)

    criteria_list = "\n".join(f"- {c}" for c in review_criteria)

    return {
        "stack": stack,
        "test_command": test_command,
        "lint_command": lint_command,
        "branch_prefix": branch_prefix,
        "commit_prefix": commit_prefix,
        "review_criteria": review_criteria,
        "criteria_list": criteria_list,
        "max_retries": max_retries,
        "max_turns": max_turns,
        "max_diff_kb": max_diff_kb,
        "agent_max_file_kb": agent_max_file_kb,
        "agent_max_total_kb": agent_max_total_kb,
        "config_found": config_found,
    }
