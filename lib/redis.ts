import { createClient } from "redis";

const createRedisClient = () => {
return createClient({
    url: process.env.REDIS_URL,
});
};

type RedisClient = ReturnType<typeof createRedisClient>;

const globalForRedis = globalThis as typeof globalThis & {
    redisClient?: RedisClient;
    redisPromise?: Promise<RedisClient>;
};

export async function getRedis(): Promise<RedisClient> {
    if (globalForRedis.redisClient?.isReady) {
        return globalForRedis.redisClient;
    }

    if (!globalForRedis.redisPromise) {
        const client = createRedisClient();

        client.on("error", (err) => {
            console.error("Redis Client Error:", err);
        });

        globalForRedis.redisPromise = client
        .connect()
        .then(() => {
            globalForRedis.redisClient = client;
            return client;
        })
        .catch((error) => {
            globalForRedis.redisPromise = undefined;
            throw error;
        });
    }

    return globalForRedis.redisPromise;
}