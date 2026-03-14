# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

sentinel-qa is an MCP (Model Context Protocol) server for QA automation. It receives test cases from pilot-ai (which handles LLM/AI logic) and executes them via Playwright (web) and Maestro (Flutter). It also performs **data log QA** — capturing analytics events (Firebase, Amplitude, etc.) during E2E test runs and validating them against predefined specs. sentinel-qa contains no LLM calls — it is purely test execution infrastructure.

## Build & Run

```bash
npm install              # Install all workspace dependencies
npm run build            # Build all packages via Turborepo
npm run test             # Run tests (depends on build)
npm run lint             # Lint all packages
```

### MCP Server

```bash
# Build and run directly
cd packages/mcp-server && npm run build
node packages/mcp-server/dist/index.js

# Test with JSON-RPC
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node packages/mcp-server/dist/index.js
```

## Architecture

**Monorepo**: npm workspaces + Turborepo. All packages under `packages/`.

**MCP Server** (`packages/mcp-server/`): stdio-based MCP server exposing 5 tools:
- `list_apps` — reads `registry/apps.yaml`
- `get_selectors` — returns app-specific UI selectors from `registry/selectors/`
- `save_tests` — stores test cases in memory (TestStore)
- `run_tests` — executes tests with optional `validate_events` flag for data log QA (stub, Playwright/Maestro runners pending)
- `get_report` — returns test results including event validation (stub, reporter pending)

**App Registry** (`registry/`): YAML-based app configuration. Each app has selectors (`registry/selectors/`) and optional event specs (`registry/event-specs/`) used for data log QA.

**Data Log QA**: During E2E test execution, analytics network requests are intercepted (Playwright `page.route()` for web, device logs for Flutter) and compared against event specs defined in `registry/event-specs/<app>.yaml`. Reports missing events, unexpected events, and parameter mismatches.

**Tool registration pattern**: Each tool is in `src/tools/<name>.ts`, exports a `register*` function that takes `McpServer` + dependencies.

## Critical Constraints

- **No `console.log()`**: stdout is the JSON-RPC stream. All logging uses `console.error()` via `src/utils/logger.ts`.
- **ESM only**: `"type": "module"` everywhere. Use `.js` extensions in imports (even for `.ts` files).
- **Shebang required**: `dist/index.js` must start with `#!/usr/bin/env node` (handled by `postbuild` script).
- **Zod 3.x**: MCP SDK compatibility. Do not upgrade to Zod 4.
- **No LLM calls**: sentinel-qa never calls Claude API or any LLM. AI logic belongs in pilot-ai.
- **Input validation**: All MCP tool inputs validated via Zod schemas in `src/schemas/tools.ts`.

## Workflow

Always follow this sequence when making changes:

1. **Develop** — write/edit code
2. **Build** — `npm run build` and fix any compile errors
3. **Test** — `npm run test` and fix any failures
4. **Update checklist** — mark completed items in `docs/sentinel-qa-checklist.md`
5. **Commit** — only after steps 1–4 pass

Never skip steps or reorder. Do not commit code that doesn't build or pass tests.

## Language

- **User-facing messages**: All strings shown to users (MCP tool responses, error messages, report output) must be in **English**.
- **Documentation and commit messages**: May be in Korean.
- **Code**: English for all code (variable names, comments, etc.).
