"""Structured logging module for agent scripts.

Provides dual-output logging: human-readable to stderr (always),
JSON lines to file (opt-in via config).
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


class _ConsoleFormatter(logging.Formatter):
    """Human-readable format: 2026-03-09 14:23:01 [INFO] [agent] message"""

    def format(self, record):
        ts = datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")
        return f"{ts} [{record.levelname}] [{record.agent_name}] {record.getMessage()}"


class _JsonFormatter(logging.Formatter):
    """JSON lines format for file output."""

    def format(self, record):
        entry = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc)
            .isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "agent": record.agent_name,
            "msg": record.getMessage(),
        }
        return json.dumps(entry, ensure_ascii=False)


class _AgentLogger(logging.LoggerAdapter):
    """Logger adapter that injects agent_name into every record."""

    def process(self, msg, kwargs):
        kwargs.setdefault("extra", {})
        kwargs["extra"]["agent_name"] = self.extra["agent_name"]
        return msg, kwargs


def _resolve_level(env_level, config_level, default="INFO"):
    """Resolve log level from env var > config > default."""
    raw = env_level or config_level or default
    raw = raw.strip().upper()
    valid = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
    return raw if raw in valid else default


def get_logging_config(config_path=None):
    """Load logging configuration from .agent-swarm/config.json.

    Args:
        config_path: Path to .agent-swarm/config.json. Defaults to
                     .agent-swarm/config.json relative to project root.

    Returns:
        Dict with keys: level, file_output, log_dir.
    """
    if not config_path:
        scripts_dir = Path(__file__).resolve().parent
        config_path = str(scripts_dir / ".." / ".." / ".agent-swarm" / "config.json")

    defaults = {"level": "INFO", "file_output": True, "log_dir": "logs"}

    if not os.path.exists(config_path):
        return defaults

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except (json.JSONDecodeError, OSError):
        return defaults

    logging_section = config.get("logging", {})
    if not isinstance(logging_section, dict):
        return defaults

    return {
        "level": logging_section.get("level", defaults["level"]),
        "file_output": logging_section.get("fileOutput", defaults["file_output"]),
        "log_dir": logging_section.get("logDir", defaults["log_dir"]),
    }


def get_logger(agent_name, config_path=None):
    """Get a configured logger for an agent.

    Attaches a console handler (stderr, human-readable) and optionally
    a JSON file handler based on config.

    Args:
        agent_name: Name used in log output (e.g. 'architect', 'critic').
        config_path: Path to agent-config.json (optional).

    Returns:
        A logging.LoggerAdapter instance.
    """
    cfg = get_logging_config(config_path)

    env_level = os.environ.get("LOG_LEVEL")
    level_str = _resolve_level(env_level, cfg["level"])
    level = getattr(logging, level_str)

    logger_name = f"agent.{agent_name}"
    logger = logging.getLogger(logger_name)

    # Avoid duplicate handlers on repeated calls
    if logger.handlers:
        return _AgentLogger(logger, {"agent_name": agent_name})

    logger.setLevel(level)
    logger.propagate = False

    # Console handler — always active, writes to stderr
    console = logging.StreamHandler(sys.stderr)
    console.setLevel(level)
    console.setFormatter(_ConsoleFormatter())
    logger.addHandler(console)

    # File handler — opt-in
    if cfg["file_output"]:
        try:
            log_dir = cfg["log_dir"]
            # Resolve relative paths from project root
            if not os.path.isabs(log_dir):
                scripts_dir = Path(__file__).resolve().parent
                log_dir = str(scripts_dir / ".." / ".." / log_dir)

            os.makedirs(log_dir, exist_ok=True)

            ts = datetime.now().strftime("%Y%m%dT%H%M%S")
            log_file = os.path.join(log_dir, f"{agent_name}-{ts}.jsonl")

            file_handler = logging.FileHandler(log_file, encoding="utf-8")
            file_handler.setLevel(level)
            file_handler.setFormatter(_JsonFormatter())
            logger.addHandler(file_handler)
        except OSError:
            # If file logging fails, continue with console only
            pass

    return _AgentLogger(logger, {"agent_name": agent_name})
