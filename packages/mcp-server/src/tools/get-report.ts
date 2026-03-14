import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReportStore } from '../report/report-store.js';
import { getReportSchema } from '../schemas/tools.js';

export function registerGetReport(server: McpServer, reportStore: ReportStore) {
  server.registerTool('get_report', {
    description: 'Get latest test result summary for an app (returns Markdown report)',
    inputSchema: getReportSchema,
  }, async ({ app_id }) => {
    const latest = await reportStore.getLatest(app_id);

    if (!latest) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            app_id,
            status: 'no reports available',
            message: 'No test reports found. Run tests first with run_tests.',
          }, null, 2),
        }],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            app_id,
            report_path: latest.path,
            summary: latest.jsonResult
              ? {
                  total: latest.jsonResult.total,
                  passed: latest.jsonResult.passed,
                  failed: latest.jsonResult.failed,
                  skipped: latest.jsonResult.skipped,
                  timedOut: latest.jsonResult.timedOut,
                  duration: latest.jsonResult.duration,
                  timestamp: latest.jsonResult.meta?.timestamp,
                }
              : null,
          }, null, 2),
        },
        {
          type: 'text' as const,
          text: latest.markdown,
        },
      ],
    };
  });
}
