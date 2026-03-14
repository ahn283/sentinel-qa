import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TestStore } from '../store/test-store.js';
import { runTestsSchema } from '../schemas/tools.js';

export function registerRunTests(server: McpServer, store: TestStore) {
  server.registerTool('run_tests', {
    description: 'Run tests for an app (long-running, supports progress notifications)',
    inputSchema: runTestsSchema,
  }, async ({ app_id, suite, platform }) => {
    const tests = store.get(app_id);
    if (!tests || tests.length === 0) {
      return {
        content: [{ type: 'text' as const, text: `No tests found for app: ${app_id}` }],
        isError: true,
      };
    }
    // Stub: return mock result. Real execution in Step 2.
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          app_id,
          suite: suite ?? 'all',
          platform: platform ?? 'all',
          total: tests.length,
          passed: tests.length,
          failed: 0,
          status: 'stub — runner not yet connected',
        }, null, 2),
      }],
    };
  });
}
