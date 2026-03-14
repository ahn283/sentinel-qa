# Contributing to sentinel-qa

Thank you for your interest in contributing to sentinel-qa!

## Getting Started

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run tests: `npm run test`

## Development Workflow

Always follow this sequence:

1. **Develop** — Write/edit code
2. **Build** — `npm run build` and fix compile errors
3. **Test** — `npm run test` and fix failures
4. **Commit** — Only after build and tests pass

## Code Style

- **ESM only** — `"type": "module"`, use `.js` extensions in imports
- **No `console.log()`** — stdout is the JSON-RPC stream. Use `console.error()` via `src/utils/logger.ts`
- **Zod 3.x** — Do not upgrade to Zod 4 (MCP SDK compatibility)
- **User-facing messages** — Must be in English
- **TypeScript strict mode** — All packages use strict: true

## Project Structure

- `packages/mcp-server/` — Core MCP server
- `packages/playwright-runner/` — Playwright web test runner
- `packages/maestro-bridge/` — Maestro Flutter test bridge
- `registry/` — App configuration and specs

## Adding a New MCP Tool

1. Create `packages/mcp-server/src/tools/<name>.ts`
2. Export a `register<Name>(server, ...deps)` function
3. Add Zod input schema in `src/schemas/tools.ts`
4. Wire it up in `src/index.ts`
5. Add tests

## Running Tests

```bash
npm run test                    # All packages
npm run test -w packages/mcp-server  # Specific package
node scripts/verify-mcp-flow.mjs     # E2E verification
```

## Submitting Changes

1. Create a branch from `main`
2. Make your changes following the workflow above
3. Open a Pull Request with a clear description
4. Ensure CI passes

## Reporting Issues

Please use [GitHub Issues](https://github.com/eodin/sentinel-qa/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version and OS
