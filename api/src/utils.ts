import logger from "./logger"

export const logMemory = (name?: string) => {

  logger.info({
    msg: `${name ? name : "Memory"}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} MB`
  })
}
