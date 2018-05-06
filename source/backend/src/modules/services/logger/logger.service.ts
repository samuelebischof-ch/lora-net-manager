import { Component } from '@nestjs/common';
import * as winston from 'winston';
import * as winstonRotator from 'winston-daily-rotate-file';

const consoleConfig = [
  new winston.transports.Console({
    'colorize': true
  })
];

const createLogger = new winston.Logger({
  'transports': consoleConfig
});

const successLogger = createLogger;
successLogger.add(winstonRotator, {
  name: 'access-file',
  level: 'info',
  filename: './logs/info-%DATE%.log',
  json: false,
  datePattern: 'YYYY-MM-DD',
});

const errorLogger = createLogger;
errorLogger.add(winstonRotator, {
  name: 'error-file',
  level: 'error',
  filename: './logs/error-%DATE%.log',
  json: false,
  datePattern: 'YYYY-MM-DD',
});

@Component()
export class LoggerService {

  print(text: string) {
    console.log(text);
  }
  
  success(event: string) {
    successLogger.info(event);
  }

  error(error: string) {
    errorLogger.error(error);
  }
}