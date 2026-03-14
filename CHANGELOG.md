# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-14

### Added
- MCP server with 5 tools: `list_apps`, `get_selectors`, `save_tests`, `run_tests`, `get_report`
- App registry with YAML-based configuration (`registry/apps.yaml`)
- Playwright web test runner with write-to-temp-file execution pattern
- Code validator blocking dangerous APIs (eval, fs, child_process, etc.)
- Data Log QA: event spec definitions and validation engine
- Analytics SDK URL patterns for GA4, Firebase, Amplitude, Mixpanel
- Quarantine system with auto-promotion/demotion based on pass rate
- Markdown report generation with event validation section
- MCP E2E verification script (`scripts/verify-mcp-flow.mjs`)
- pilot-ai integration guide (`docs/pilot-ai-integration-guide.md`)
