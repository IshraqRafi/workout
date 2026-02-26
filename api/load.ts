import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const redis = new Redis(process.env.REDIS_URL || '');

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const historyData = await redis.get('ishraq_history');
        const settingsData = await redis.get('ishraq_settings');

        res.status(200).json({
            history: historyData ? JSON.parse(historyData) : [],
            settings: settingsData ? JSON.parse(settingsData) : null
        });
    } catch (error) {
        console.error("Redis Load Error:", error);
        res.status(500).json({ error: 'Failed to load data from Redis' });
    }
}
