type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const envLevel = process.env.LOG_LEVEL as string | undefined;
const MIN_LEVEL: LogLevel = envLevel && envLevel in LEVEL_PRIORITY ? (envLevel as LogLevel) : "info";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

function formatPrefix(tag: string): string {
  return `[${tag}]`;
}

export function createLogger(tag: string) {
  const prefix = formatPrefix(tag);
  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug")) console.log(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (shouldLog("info")) console.log(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn")) console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      if (shouldLog("error")) console.error(prefix, ...args);
    },
  };
}

export class ScraperLogger {
  private results: { name: string; count: number; error?: string; skipped?: boolean }[] = [];
  private startTime = 0;
  private _lastCycleEnd = 0;
  private _lastSuccessfulFeeds = 0;
  private _lastFailedFeeds = 0;
  private _lastSkippedFeeds = 0;
  private logger = createLogger("Scraper");

  get lastCycleEnd() { return this._lastCycleEnd; }
  get lastSuccessfulFeeds() { return this._lastSuccessfulFeeds; }
  get lastFailedFeeds() { return this._lastFailedFeeds; }
  get lastSkippedFeeds() { return this._lastSkippedFeeds; }

  startCycle() {
    this.results = [];
    this.startTime = Date.now();
    this.logger.info("Starting threat data fetch cycle...");
  }

  recordFeed(name: string, count: number) {
    if (count === -1) {
      this.results.push({ name, count: 0, skipped: true });
    } else {
      this.results.push({ name, count });
    }
  }

  recordError(name: string, error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    this.results.push({ name, count: 0, error: msg });
  }

  endCycle() {
    this._lastCycleEnd = Date.now();
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const successful = this.results.filter(r => !r.error && !r.skipped);
    const failed = this.results.filter(r => r.error);
    const skipped = this.results.filter(r => r.skipped);
    this._lastSuccessfulFeeds = successful.length;
    this._lastFailedFeeds = failed.length;
    this._lastSkippedFeeds = skipped.length;
    const totalRecords = successful.reduce((sum, r) => sum + r.count, 0);

    const parts = [`${successful.length} OK`, `${failed.length} failed`];
    if (skipped.length > 0) parts.push(`${skipped.length} throttled`);
    parts.push(`${totalRecords} records in ${elapsed}s`);

    this.logger.info(`Cycle complete: ${parts.join(", ")}`);

    if (failed.length > 0) {
      this.logger.warn(
        `Failed feeds: ${failed.map(f => `${f.name} (${f.error})`).join(", ")}`
      );
    }
  }
}

export const scraperLog = new ScraperLogger();
