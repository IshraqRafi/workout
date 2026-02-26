import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const redis = new Redis(process.env.REDIS_URL || '');

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { history, settings } = req.body;

        if (history) {
            await redis.set('ishraq_history', JSON.stringify(history));
        }

        if (settings) {
            await redis.set('ishraq_settings', JSON.stringify(settings));
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Redis Save Error:", error);
        res.status(500).json({ error: 'Failed to save data to Redis' });
    }
}
