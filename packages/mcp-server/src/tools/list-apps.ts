import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppRegistry } from '../registry/registry.js';

export function registerListApps(server: McpServer, registry: AppRegistry) {
  server.registerTool('list_apps', {
    description: 'List all registered apps in the registry',
  }, async () => ({
    content: [{ type: 'text' as const, text: JSON.stringify(registry.listApps(), null, 2) }],
  }));
}
