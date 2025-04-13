import APP_CONFIG from '@/config'
import { AppLogLevel } from './log-level.const'

// Use `any` as the message can be of any type from string, number, array, object, boolean e.t.c
type MessageType = unknown

export default class Logger {
  /**
   * Log critical error messages
   *
   * @param {MessageType} message - The main error message to log
   * @param {MessageType[]} args - Additional arguments to log
   */
  static error(message: MessageType, ...args: MessageType[]): void {
    if (APP_CONFIG.LOG_LEVEL <= AppLogLevel.error) {
      console.error(message, ...args)
    }
  }

  /**
   * Log warning messages that are not critical
   *
   * @param {MessageType} message - The main warning message to log
   * @param {MessageType[]} args - Additional arguments to log
   */
  static warn(message: MessageType, ...args: MessageType[]): void {
    if (APP_CONFIG.LOG_LEVEL <= AppLogLevel.warn) {
      console.warn(message, ...args)
    }
  }

  /**
   * Log general information messages
   *
   * @param {MessageType} message - The main info message to log
   * @param {MessageType[]} args - Additional arguments to log
   */
  static info(message: MessageType, ...args: MessageType[]): void {
    if (APP_CONFIG.LOG_LEVEL <= AppLogLevel.info) {
      console.info(message, ...args)
    }
  }

  /**
   * Log debug messages useful for developers
   *
   * @param {MessageType} message - The main debug message to log
   * @param {MessageType[]} args - Additional arguments to log
   */
  static log(message: MessageType, ...args: MessageType[]): void {
    if (APP_CONFIG.LOG_LEVEL >= AppLogLevel.debug) {
      // `console.debug` requires enabling debug mode in the browser. Using `console.log` instead
      console.log(message, ...args)
    }
  }

  /**
   * Log trace messages with stack traces
   *
   * @param {MessageType} message - The main trace message to log
   * @param {MessageType[]} args - Additional arguments to log
   */
  static trace(message: MessageType, ...args: MessageType[]): void {
    if (APP_CONFIG.LOG_LEVEL >= AppLogLevel.trace) {
      console.trace(message, ...args)
    }
  }
}
