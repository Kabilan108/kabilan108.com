// ANSI color codes
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
} as const;

const LOG_LEVELS = {
  DEBUG: { color: COLORS.blue, label: "DEBUG" },
  INFO: { color: COLORS.green, label: "INFO " },
  WARN: { color: COLORS.yellow, label: "WARN " },
  ERROR: { color: COLORS.red, label: "ERROR" },
} as const;

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace("T", " ").split(".")[0];
};

const formatLog = (level: keyof typeof LOG_LEVELS, message: string): string => {
  const { color, label } = LOG_LEVELS[level];
  return `${formatTimestamp()} | ${color}${label}${COLORS.reset} | ${message}`;
};

const logger = {
  debug: (message: string) => console.debug(formatLog("DEBUG", message)),
  info: (message: string) => console.info(formatLog("INFO", message)),
  warn: (message: string) => console.warn(formatLog("WARN", message)),
  error: (message: string) => console.error(formatLog("ERROR", message)),
};

export default logger;
