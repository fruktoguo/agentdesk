---
name: agentdesk-api
description: Operate AgentDesk, ai-review, or TaskHub through its HTTP agent API with a project token and X-Agent-Role. Use when an AI agent needs to read or update project planning, list/create/claim/release/complete/mark-needs-fix tasks, create/resolve/convert issues, or coordinate work through AgentDesk API credentials.
---

# AgentDesk API

Use this skill to control an AgentDesk project over HTTP. The API is project-scoped by token and role; it does not require a browser session.

## Credentials

Create a skill-local `.env` file from `.env.example`:

```env
AGENTDESK_HOST=https://taskhub.yuohira.com/
AGENTDESK_TOKEN=project-token
```

The bundled helper automatically loads `.env` from the same skill directory. The `.env` file is for `AGENTDESK_HOST` and `AGENTDESK_TOKEN` only; `.env` is intentionally git-ignored.

Every request needs:

```http
Authorization: Bearer <token>
X-Agent-Role: <role>
```

Choose the role at runtime. Infer a concise role from the current AI/model and job when it is obvious, such as `codex`, `claude`, `code-reviewer`, `fix-bot`, or `docs-bot`. If the role is not obvious, ask the developer what role to use. Pass it with `--role` or set `AGENTDESK_ROLE` in the shell/session; do not store it in the skill `.env`.

Never invent a token, print a token, paste it into final answers, or commit it. If host/token are absent from `.env`, ask the user to configure them or provide a safe local secret source.

## Fast Path

Use the bundled helper for routine calls:

```bash
python3 scripts/agentdesk_api.py --role codex planning
python3 scripts/agentdesk_api.py --role codex tasks --status OPEN
python3 scripts/agentdesk_api.py --role codex claim-next
python3 scripts/agentdesk_api.py --role codex complete <taskId> --result "Implemented and verified."
```

When calling from outside the skill directory, use the full path to `scripts/agentdesk_api.py`. The helper uses only Python stdlib, reads `AGENTDESK_HOST` and `AGENTDESK_TOKEN` from the skill `.env`, and accepts the role from `--role` or `AGENTDESK_ROLE`. Use `--help` on any command for exact arguments.

## Agent Workflow

1. Read planning first unless the user gave a specific task:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> planning
   ```
2. List work:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> tasks --status OPEN
   python3 scripts/agentdesk_api.py --role <role> tasks --status NEEDS_FIX
   ```
3. Claim before doing work:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> claim-next
   python3 scripts/agentdesk_api.py --role <role> claim <taskId>
   ```
4. Do the repository or operational work locally.
5. Finish the task with a useful audit result:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> complete <taskId> --result "Summary, files changed, verification."
   ```
6. If blocked by a real defect or missing input, mark it:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> needs-fix <taskId> --reason "Concrete blocker or failed acceptance criterion."
   ```
7. If unrelated issues are discovered, create an issue instead of overloading the task:
   ```bash
   python3 scripts/agentdesk_api.py --role <role> create-issue --title "Short title" --severity HIGH --description "Repro and impact."
   ```

Keep `AGENTDESK_ROLE` stable during a task so the event log is coherent.

## Operations

Tasks:

```bash
agentdesk_api.py tasks [--status OPEN|CLAIMED|DONE|NEEDS_FIX|CANCELLED]
agentdesk_api.py create-task --title "..." [--description "..."] [--type general] [--priority LOW|MEDIUM|HIGH|URGENT]
agentdesk_api.py claim-next
agentdesk_api.py claim <taskId>
agentdesk_api.py release <taskId>
agentdesk_api.py complete <taskId> [--result "..."] [--result-file path|-]
agentdesk_api.py needs-fix <taskId> [--reason "..."] [--reason-file path|-]
```

Issues:

```bash
agentdesk_api.py issues [--status OPEN|RESOLVED]
agentdesk_api.py create-issue --title "..." [--description "..."] [--severity LOW|MEDIUM|HIGH|URGENT]
agentdesk_api.py issue-to-task <issueId>
agentdesk_api.py resolve-issue <issueId>
```

Planning:

```bash
agentdesk_api.py planning
agentdesk_api.py update-planning --text "markdown"
agentdesk_api.py update-planning --file planning.md
agentdesk_api.py update-planning --file -
```

When updating planning, read the current planning first and preserve unrelated content. Treat planning as shared long-lived context, not a scratchpad.

## Raw API

Base path: `<AGENTDESK_HOST>/api/agent`.

| Method | Path | Body |
| --- | --- | --- |
| GET | `/tasks?status=OPEN` | none |
| POST | `/tasks` | `{ "title": "...", "description": "...", "type": "general", "priority": "HIGH" }` |
| POST | `/tasks/claim-next` | none |
| POST | `/tasks/{taskId}/claim` | none |
| POST | `/tasks/{taskId}/release` | none |
| POST | `/tasks/{taskId}/complete` | `{ "result": "..." }` |
| POST | `/tasks/{taskId}/needs-fix` | `{ "reason": "..." }` |
| GET | `/issues?status=OPEN` | none |
| POST | `/issues` | `{ "title": "...", "description": "...", "severity": "HIGH" }` |
| POST | `/issues/{issueId}/to-task` | none |
| POST | `/issues/{issueId}/resolve` | none |
| GET | `/planning` | none |
| PUT | `/planning` | `{ "planning": "markdown text" }` |

Responses are JSON and usually contain `task`, `tasks`, `issue`, `issues`, `planning`, or `error`.

## Error Handling

- `401`: missing/invalid token or missing role. Re-check headers and secrets without printing them.
- `403`: token belongs to another project or the resource is outside the token project.
- `404`: task/issue not found, or no claimable task for `claim-next`.
- `409`: state conflict, such as already claimed, not currently claimed, already converted, or not open.
- `422`: body failed validation. Check enum values and field lengths.

On conflicts, refresh the task/issue list before retrying. Do not repeatedly retry state-changing calls without checking current state.
