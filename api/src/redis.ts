import { createClient, RedisClientType } from 'redis';


export let redisClient: RedisClientType | null = null;

createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  }
}).on('error', (err: string) => console.log('Redis Client Error', err))
  .connect().then((redisClient) => {
    redisClient = redisClient as RedisClientType;
  });


export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }

  return redisClient;
}
