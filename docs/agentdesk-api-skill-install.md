# AgentDesk API Skill Install

This repository includes a portable AI skill at:

```text
skills/agentdesk-api
```

The skill follows the common `SKILL.md` directory shape used by Codex-style and Claude-style agents:

```text
agentdesk-api/
  SKILL.md
  agents/openai.yaml
  scripts/agentdesk_api.py
  .env.example
```

Do not commit `.env`; it is intentionally ignored.

## GitHub Links

After this repository is pushed to GitHub, use these links:

```text
Skill directory:
https://github.com/fruktoguo/agentdesk/tree/main/skills/agentdesk-api

Raw SKILL.md:
https://raw.githubusercontent.com/fruktoguo/agentdesk/main/skills/agentdesk-api/SKILL.md

Raw helper script:
https://raw.githubusercontent.com/fruktoguo/agentdesk/main/skills/agentdesk-api/scripts/agentdesk_api.py
```

## Install For Codex

From a checkout of this repository:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/agentdesk-api "${CODEX_HOME:-$HOME/.codex}/skills/"
cp "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/.env.example" \
  "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/.env"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/scripts/agentdesk_api.py"
```

Then edit:

```text
~/.codex/skills/agentdesk-api/.env
```

Set `AGENTDESK_HOST` and `AGENTDESK_TOKEN`. Do not put `AGENTDESK_ROLE` in `.env`; the AI should pass `--role` or ask the developer which role to use.

## Install For Claude Code Or Other Agents

Copy the whole `skills/agentdesk-api` directory into that agent's local skills directory. The important contract is the directory containing `SKILL.md`, with bundled resources next to it.

Generic install:

```bash
mkdir -p "$HOME/.claude/skills"
cp -R skills/agentdesk-api "$HOME/.claude/skills/"
cp "$HOME/.claude/skills/agentdesk-api/.env.example" "$HOME/.claude/skills/agentdesk-api/.env"
chmod +x "$HOME/.claude/skills/agentdesk-api/scripts/agentdesk_api.py"
```

If the agent supports installing from a GitHub URL, give it the skill directory URL above. If it asks for a single file URL, give it the raw `SKILL.md` URL and tell it to copy the sibling `scripts/` directory as bundled resources.

## Quick Test

After setting `.env`, run:

```bash
python3 ~/.codex/skills/agentdesk-api/scripts/agentdesk_api.py --role codex planning
```

The command should return JSON with a `planning` field.
