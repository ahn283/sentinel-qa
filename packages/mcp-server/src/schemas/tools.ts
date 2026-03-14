import { z } from 'zod';

export const getSelectorsSchema = {
  app_id: z.string().describe('App ID from registry'),
};

export const saveTestsSchema = {
  app_id: z.string().describe('App ID'),
  test_cases: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      confidence: z.number(),
      status: z.enum(['approved', 'pending']),
      platform: z.array(z.enum(['flutter', 'web'])),
      code: z.string().describe('Executable test code'),
    }),
  ),
};

export const runTestsSchema = {
  app_id: z.string().describe('App ID'),
  suite: z.string().optional().describe('Test suite name'),
  platform: z.enum(['web', 'ios', 'android']).optional().describe('Target platform'),
  validate_events: z.boolean().optional().describe('Enable data log QA — validate analytics events against spec (default: false)'),
  include_quarantine: z.boolean().optional().describe('Include quarantined tests in execution (default: false)'),
};

export const getReportSchema = {
  app_id: z.string().describe('App ID'),
};
