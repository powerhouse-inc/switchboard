import { createClient, RedisClientType } from 'redis';


export let redisClient: RedisClientType | null = null;

export const initRedis = async () => {
  if (!redisClient) {
    redisClient = await createClient({
      url: process.env.REDIS_TLS_URL,
      socket: process.env.REDIS_TLS_URL && process.env.REDIS_TLS_URL.indexOf("rediss") !== -1 ? {
        tls: true,
        rejectUnauthorized: false,
      } : undefined
    }).on('error', (err: string) => console.log('Redis Client Error', err))
      .connect() as RedisClientType;
  }

  return redisClient;
}



const timer = setInterval(async () => {
  try {
    redisClient && await redisClient.ping();
  } catch (err) {
    console.error('Ping Interval Error', err);
  }
}, 1000 * 60 * 4);

export const closeRedis = () => {
  clearInterval(timer);
  redisClient && redisClient.disconnect();
}
