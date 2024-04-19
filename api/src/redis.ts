import { createClient, RedisClientType } from 'redis';


export let redisClient: RedisClientType | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createClient({
      url: process.env.REDIS_TLS_URL,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      }
    }).on('error', (err: string) => console.log('Redis Client Error', err))
      .connect() as RedisClientType;
  }

  return redisClient;
}
