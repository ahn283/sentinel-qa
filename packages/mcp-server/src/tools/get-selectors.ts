import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppRegistry } from '../registry/registry.js';
import { getSelectorsSchema } from '../schemas/tools.js';

export function registerGetSelectors(server: McpServer, registry: AppRegistry) {
  server.registerTool('get_selectors', {
    description: 'Get UI selector mappings for an app (used for test code generation)',
    inputSchema: getSelectorsSchema,
  }, async ({ app_id }) => {
    const selectors = await registry.getSelectors(app_id);
    if (!selectors) {
      return {
        content: [{ type: 'text' as const, text: `No selectors found for app: ${app_id}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(selectors, null, 2) }],
    };
  });
}
