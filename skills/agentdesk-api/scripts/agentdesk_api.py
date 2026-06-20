#!/usr/bin/env python3
"""Small stdlib client for the AgentDesk agent HTTP API."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parents[1]
DOTENV_PATH = SKILL_DIR / ".env"


def parse_dotenv(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


DOTENV = parse_dotenv(DOTENV_PATH)


def config_value(args: argparse.Namespace, attr: str, env_name: str, dotenv_keys: tuple[str, ...]) -> str:
    arg_value = getattr(args, attr, None)
    if arg_value:
        return arg_value.strip()
    env_value = os.environ.get(env_name)
    if env_value:
        return env_value.strip()
    for key in dotenv_keys:
        value = DOTENV.get(key)
        if value:
            return value.strip()
    return ""


def read_text(value: str | None, file_path: str | None, field: str) -> str | None:
    if value is not None and file_path is not None:
        raise SystemExit(f"Use either --{field} or --{field}-file, not both")
    if file_path is None:
        return value
    if file_path == "-":
        return sys.stdin.read()
    return Path(file_path).read_text(encoding="utf-8")


def require_config(args: argparse.Namespace) -> tuple[str, str, str]:
    host = config_value(args, "host", "AGENTDESK_HOST", ("AGENTDESK_HOST", "HOST")).rstrip("/")
    token = config_value(args, "token", "AGENTDESK_TOKEN", ("AGENTDESK_TOKEN", "TOKEN"))
    role = (args.role or os.environ.get("AGENTDESK_ROLE") or "").strip()
    missing = [
        name
        for name, value in (
            (f"AGENTDESK_HOST in {DOTENV_PATH}", host),
            (f"AGENTDESK_TOKEN in {DOTENV_PATH}", token),
            ("--role or AGENTDESK_ROLE", role),
        )
        if not value
    ]
    if missing:
        raise SystemExit("Missing config: " + ", ".join(missing))
    return host, token, role


def request(
    args: argparse.Namespace,
    method: str,
    path: str,
    body: dict[str, Any] | None = None,
    query: dict[str, str | None] | None = None,
) -> Any:
    host, token, role = require_config(args)
    url = host + "/api/agent" + path
    if query:
        clean_query = {k: v for k, v in query.items() if v is not None}
        if clean_query:
            url += "?" + urllib.parse.urlencode(clean_query)

    data = None
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Agent-Role": role,
        "Accept": "application/json",
    }
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=args.timeout) as resp:
            payload = resp.read().decode("utf-8")
            return json.loads(payload) if payload else {}
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(payload)
        except json.JSONDecodeError:
            parsed = {"error": payload or exc.reason}
        print(json.dumps(parsed, ensure_ascii=False, indent=2), file=sys.stderr)
        raise SystemExit(exc.code)
    except urllib.error.URLError as exc:
        raise SystemExit(f"Request failed: {exc.reason}") from exc


def print_json(data: Any) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def cmd_planning(args: argparse.Namespace) -> None:
    print_json(request(args, "GET", "/planning"))


def cmd_update_planning(args: argparse.Namespace) -> None:
    planning = read_text(args.text, args.file, "text")
    if planning is None:
        raise SystemExit("update-planning requires --text or --file")
    print_json(request(args, "PUT", "/planning", {"planning": planning}))


def cmd_tasks(args: argparse.Namespace) -> None:
    print_json(request(args, "GET", "/tasks", query={"status": args.status}))


def cmd_create_task(args: argparse.Namespace) -> None:
    body: dict[str, Any] = {"title": args.title}
    if args.description is not None:
        body["description"] = args.description
    if args.type is not None:
        body["type"] = args.type
    if args.priority is not None:
        body["priority"] = args.priority
    print_json(request(args, "POST", "/tasks", body))


def cmd_claim_next(args: argparse.Namespace) -> None:
    print_json(request(args, "POST", "/tasks/claim-next"))


def cmd_task_action(args: argparse.Namespace, action: str, body: dict[str, Any] | None = None) -> None:
    task_id = urllib.parse.quote(args.task_id, safe="")
    print_json(request(args, "POST", f"/tasks/{task_id}/{action}", body))


def cmd_claim(args: argparse.Namespace) -> None:
    cmd_task_action(args, "claim")


def cmd_release(args: argparse.Namespace) -> None:
    cmd_task_action(args, "release")


def cmd_complete(args: argparse.Namespace) -> None:
    result = read_text(args.result, args.result_file, "result")
    body = {"result": result} if result is not None else {}
    cmd_task_action(args, "complete", body)


def cmd_needs_fix(args: argparse.Namespace) -> None:
    reason = read_text(args.reason, args.reason_file, "reason")
    body = {"reason": reason} if reason is not None else {}
    cmd_task_action(args, "needs-fix", body)


def cmd_issues(args: argparse.Namespace) -> None:
    print_json(request(args, "GET", "/issues", query={"status": args.status}))


def cmd_create_issue(args: argparse.Namespace) -> None:
    body: dict[str, Any] = {"title": args.title}
    if args.description is not None:
        body["description"] = args.description
    if args.severity is not None:
        body["severity"] = args.severity
    print_json(request(args, "POST", "/issues", body))


def cmd_issue_action(args: argparse.Namespace, action: str) -> None:
    issue_id = urllib.parse.quote(args.issue_id, safe="")
    print_json(request(args, "POST", f"/issues/{issue_id}/{action}"))


def cmd_issue_to_task(args: argparse.Namespace) -> None:
    cmd_issue_action(args, "to-task")


def cmd_resolve_issue(args: argparse.Namespace) -> None:
    cmd_issue_action(args, "resolve")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AgentDesk agent API helper")
    parser.add_argument("--host", help="AgentDesk host; defaults to AGENTDESK_HOST in skill .env")
    parser.add_argument("--token", help="Project token; defaults to AGENTDESK_TOKEN in skill .env")
    parser.add_argument("--role", help="Agent role; defaults to AGENTDESK_ROLE; not read from skill .env")
    parser.add_argument("--timeout", type=float, default=30.0)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("planning", help="Read project planning")
    p.set_defaults(func=cmd_planning)

    p = sub.add_parser("update-planning", help="Replace project planning")
    p.add_argument("--text")
    p.add_argument("--file")
    p.set_defaults(func=cmd_update_planning)

    p = sub.add_parser("tasks", help="List tasks")
    p.add_argument("--status", choices=["OPEN", "CLAIMED", "DONE", "NEEDS_FIX", "CANCELLED"])
    p.set_defaults(func=cmd_tasks)

    p = sub.add_parser("create-task", help="Create a task")
    p.add_argument("--title", required=True)
    p.add_argument("--description")
    p.add_argument("--type")
    p.add_argument("--priority", choices=["LOW", "MEDIUM", "HIGH", "URGENT"])
    p.set_defaults(func=cmd_create_task)

    p = sub.add_parser("claim-next", help="Claim the next open or needs-fix task")
    p.set_defaults(func=cmd_claim_next)

    p = sub.add_parser("claim", help="Claim a task")
    p.add_argument("task_id")
    p.set_defaults(func=cmd_claim)

    p = sub.add_parser("release", help="Release a claimed task")
    p.add_argument("task_id")
    p.set_defaults(func=cmd_release)

    p = sub.add_parser("complete", help="Complete a claimed task")
    p.add_argument("task_id")
    p.add_argument("--result")
    p.add_argument("--result-file")
    p.set_defaults(func=cmd_complete)

    p = sub.add_parser("needs-fix", help="Mark a claimed task as needing fixes")
    p.add_argument("task_id")
    p.add_argument("--reason")
    p.add_argument("--reason-file")
    p.set_defaults(func=cmd_needs_fix)

    p = sub.add_parser("issues", help="List issues")
    p.add_argument("--status", choices=["OPEN", "RESOLVED"])
    p.set_defaults(func=cmd_issues)

    p = sub.add_parser("create-issue", help="Create an issue")
    p.add_argument("--title", required=True)
    p.add_argument("--description")
    p.add_argument("--severity", choices=["LOW", "MEDIUM", "HIGH", "URGENT"])
    p.set_defaults(func=cmd_create_issue)

    p = sub.add_parser("issue-to-task", help="Convert an issue to a task")
    p.add_argument("issue_id")
    p.set_defaults(func=cmd_issue_to_task)

    p = sub.add_parser("resolve-issue", help="Resolve an issue")
    p.add_argument("issue_id")
    p.set_defaults(func=cmd_resolve_issue)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
