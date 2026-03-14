import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getReportSchema } from '../schemas/tools.js';

export function registerGetReport(server: McpServer) {
  server.registerTool('get_report', {
    description: 'Get latest test result summary for an app',
    inputSchema: getReportSchema,
  }, async ({ app_id }) => {
    // Stub: no real report yet
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          app_id,
          status: 'no reports available yet',
          message: 'Reporter not yet connected (Step 6)',
        }, null, 2),
      }],
    };
  });
}
