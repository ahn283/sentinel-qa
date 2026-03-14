import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TestStore } from '../store/test-store.js';
import { saveTestsSchema } from '../schemas/tools.js';

export function registerSaveTests(server: McpServer, store: TestStore) {
  server.registerTool('save_tests', {
    description: 'Save generated test cases/code',
    inputSchema: saveTestsSchema,
  }, async ({ app_id, test_cases }) => {
    store.save(app_id, test_cases);
    return {
      content: [{ type: 'text' as const, text: `${test_cases.length} test(s) saved for ${app_id}` }],
    };
  });
}
