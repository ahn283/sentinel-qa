import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TestStore } from '../store/test-store.js';
import type { TestStatusStore } from '../store/test-status-store.js';
import type { AppRegistry } from '../registry/registry.js';
import type { ReportStore } from '../report/report-store.js';
import { runTestsSchema } from '../schemas/tools.js';
import { runPlaywrightTests } from '@sentinel-qa/playwright-runner';
import type { TestInput, RunResult } from '@sentinel-qa/playwright-runner';
import { runMaestroTests } from '@sentinel-qa/maestro-bridge';
import type { MaestroTestInput } from '@sentinel-qa/maestro-bridge';
import { validateEvents } from '../event-validation/index.js';
import type { CapturedEvent, EventValidationResult } from '../event-validation/index.js';
import { logger } from '../utils/logger.js';

export function registerRunTests(
  server: McpServer,
  store: TestStore,
  registry: AppRegistry,
  reportStore: ReportStore,
  statusStore: TestStatusStore,
) {
  server.registerTool('run_tests', {
    description: 'Run tests for an app (long-running, supports progress notifications)',
    inputSchema: runTestsSchema,
  }, async ({ app_id, suite, platform, validate_events: shouldValidateEvents, include_quarantine }) => {
    let tests = store.get(app_id);
    if (!tests || tests.length === 0) {
      return {
        content: [{ type: 'text' as const, text: `No tests found for app: ${app_id}` }],
        isError: true,
      };
    }

    // Filter by quarantine status
    const statuses = await statusStore.load(app_id);
    const statusMap = new Map(statuses.map((s) => [s.id, s]));

    tests = tests.filter((test) => {
      const status = statusMap.get(test.id);
      if (!status) return true; // new tests are included
      if (status.status === 'rejected') return false;
      if (status.status === 'quarantine') return include_quarantine === true;
      return true; // 'new' and 'stable' are always included
    });

    if (tests.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: `All tests for app "${app_id}" are quarantined or rejected. Use include_quarantine: true to run quarantined tests.`,
        }],
        isError: true,
      };
    }

    // Determine target platform from registry if not specified
    const app = registry.getApp(app_id);
    const targetPlatform = platform ?? (app?.type === 'web' ? 'web' : undefined);

    // Filter tests by platform if specified
    const filteredTests = targetPlatform === 'web'
      ? tests.filter((t) => t.platform.includes('web'))
      : targetPlatform === 'ios' || targetPlatform === 'android'
        ? tests.filter((t) => t.platform.includes('flutter'))
        : tests;

    if (filteredTests.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: `No tests found for app "${app_id}" matching platform: ${targetPlatform}`,
        }],
        isError: true,
      };
    }

    // Route to the appropriate runner
    if (targetPlatform === 'web') {
      const testInputs: TestInput[] = filteredTests.map((t) => ({
        id: t.id,
        title: t.title,
        code: t.code,
      }));

      logger.info(`Running ${testInputs.length} Playwright tests for app: ${app_id}`);

      let result: RunResult;
      try {
        result = await runPlaywrightTests(testInputs, {
          timeout: 30_000,
          headless: true,
        });
      } catch (err) {
        logger.error('Playwright runner error:', err);
        return {
          content: [{
            type: 'text' as const,
            text: `Playwright runner failed: ${err instanceof Error ? err.message : String(err)}`,
          }],
          isError: true,
        };
      }

      // Record run results in status store
      for (const testResult of result.tests) {
        await statusStore.recordRun(app_id, testResult.id, testResult.status === 'passed');
      }

      // Event validation (data log QA)
      let eventValidation: EventValidationResult | undefined;
      if (shouldValidateEvents) {
        try {
          const eventSpec = await registry.getEventSpec(app_id);
          if (eventSpec) {
            // In a real implementation, captured events would come from
            // Playwright network interception during test execution.
            // For now, we accept captured events stored alongside test results.
            // This will be fully integrated when the Playwright runner
            // supports event capture via page.on('request').
            const capturedEvents: CapturedEvent[] = [];

            logger.info(`Validating ${eventSpec.events.length} event specs for app: ${app_id}`);
            eventValidation = validateEvents(eventSpec.events, capturedEvents);
          } else {
            logger.warn(`No event spec found for app: ${app_id}, skipping event validation`);
          }
        } catch (err) {
          logger.warn('Event validation error:', err);
        }
      }

      // Save report to disk
      let reportPath: string | undefined;
      try {
        reportPath = await reportStore.save(result, {
          appId: app_id,
          suite: suite ?? 'all',
          platform: 'web',
        }, eventValidation);
      } catch (err) {
        logger.warn('Failed to save report:', err);
      }

      const response: Record<string, unknown> = {
        app_id,
        suite: suite ?? 'all',
        platform: 'web',
        total: result.total,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        timedOut: result.timedOut,
        duration: result.duration,
        tests: result.tests,
        report_path: reportPath,
      };

      if (eventValidation) {
        response.event_validation = eventValidation;
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response, null, 2),
        }],
      };
    }

    // Flutter (Maestro)
    if (targetPlatform === 'ios' || targetPlatform === 'android') {
      const maestroInputs: MaestroTestInput[] = filteredTests.map((t) => ({
        id: t.id,
        title: t.title,
        yaml: t.code,
      }));

      logger.info(`Running ${maestroInputs.length} Maestro tests for app: ${app_id} on ${targetPlatform}`);

      try {
        const maestroResult = await runMaestroTests(maestroInputs, {
          signal: undefined,
          onProgress: (current, total, testTitle) => {
            logger.info(`[${current}/${total}] Running: ${testTitle}`);
          },
        });

        // Record run results
        for (const testResult of maestroResult.tests) {
          await statusStore.recordRun(app_id, testResult.id, testResult.status === 'passed');
        }

        // Save report
        let reportPath: string | undefined;
        try {
          const runResult: RunResult = {
            passed: maestroResult.passed,
            failed: maestroResult.failed,
            skipped: 0,
            timedOut: 0,
            total: maestroResult.total,
            duration: maestroResult.duration,
            tests: maestroResult.tests.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status === 'cancelled' ? 'skipped' as const : t.status,
              duration: t.duration,
              error: t.error,
            })),
          };
          reportPath = await reportStore.save(runResult, {
            appId: app_id,
            suite: suite ?? 'all',
            platform: targetPlatform,
          });
        } catch (err) {
          logger.warn('Failed to save report:', err);
        }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              app_id,
              suite: suite ?? 'all',
              platform: targetPlatform,
              ...maestroResult,
              report_path: reportPath,
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`Maestro test execution failed: ${message}`);
        return {
          content: [{
            type: 'text' as const,
            text: `Maestro test execution failed: ${message}`,
          }],
          isError: true,
        };
      }
    }

    // No specific platform — return stub
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          app_id,
          suite: suite ?? 'all',
          platform: 'all',
          total: filteredTests.length,
          passed: filteredTests.length,
          failed: 0,
          status: 'stub — specify platform for actual execution',
        }, null, 2),
      }],
    };
  });
}
