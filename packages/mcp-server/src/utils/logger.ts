export const logger = {
  info: (...args: unknown[]) => console.error('[sentinel-ai]', ...args),
  warn: (...args: unknown[]) => console.error('[sentinel-ai:warn]', ...args),
  error: (...args: unknown[]) => console.error('[sentinel-ai:error]', ...args),
  debug: (...args: unknown[]) => {
    if (process.env.DEBUG) {
      console.error('[sentinel-ai:debug]', ...args);
    }
  },
};
