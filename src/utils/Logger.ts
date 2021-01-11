import * as pino from "pino"

export const logger = pino.default({ enabled: process.env.DEV ? true : false })