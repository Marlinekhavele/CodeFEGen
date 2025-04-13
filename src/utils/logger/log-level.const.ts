/**
 * At the point of usage, you can check if the configured log level is less than or equal to
 * the log level of the message before logging it. This means that the every log level with a
 * weight less than or equal to the configured log level will be logged.
 *
 * Example:
 * If the log level is set to `info`, only `info`, `warn` and `error` messages will be logged.
 */
export const AppLogLevel: Readonly<{ [key: string]: number }> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
}
