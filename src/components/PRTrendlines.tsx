import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { DetailedWorkoutLog } from '../contexts/WorkoutContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PRDataPoint {
    date: string;
    dateShort: string;
    maxReps: number;
}

const TRACKED_EXERCISES = [
    { id: 'push', name: 'Push-ups Core', keywords: ['push-up', 'pushup', 'push up'] },
    { id: 'pull', name: 'Pull-up Mastery', keywords: ['pull-up', 'pullup', 'pull up'] },
    { id: 'squat', name: 'Squat Power', keywords: ['squat', 'lunge'] },
];

export function PRTrendlines({ history }: { history: DetailedWorkoutLog[] }) {
    const [selectedEx, setSelectedEx] = useState(TRACKED_EXERCISES[0].id);

    const chartData = useMemo(() => {
        const exConfig = TRACKED_EXERCISES.find(e => e.id === selectedEx);
        if (!exConfig) return [];

        const dataPoints: PRDataPoint[] = [];

        [...history]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach(log => {
                let sessionMax = 0;
                log.exercises.forEach(ex => {
                    const isMatch = exConfig.keywords.some(kw => ex.name.toLowerCase().includes(kw));
                    if (isMatch) {
                        ex.sets.forEach(set => {
                            if (set.isCompleted && set.completedReps) {
                                // Extract number from completedReps (might be "15" or "15 reps")
                                const reps = parseInt(set.completedReps.toString().replace(/\D/g, ''), 10);
                                if (!isNaN(reps) && reps > sessionMax) {
                                    sessionMax = reps;
                                }
                            }
                        });
                    }
                });

                if (sessionMax > 0) {
                    dataPoints.push({
                        date: log.date,
                        dateShort: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        maxReps: sessionMax
                    });
                }
            });

        return dataPoints;
    }, [history, selectedEx]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', marginTop: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Personal Records</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Max unbroken reps trendline</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                    {TRACKED_EXERCISES.map(ex => (
                        <button
                            key={ex.id}
                            onClick={() => setSelectedEx(ex.id)}
                            style={{
                                background: selectedEx === ex.id ? 'var(--primary)' : 'transparent',
                                color: selectedEx === ex.id ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {ex.name}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="dateShort"
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ background: 'rgba(15, 15, 20, 0.9)', border: '1px solid var(--border-glow)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="maxReps"
                                stroke="var(--primary)"
                                strokeWidth={4}
                                dot={{ fill: 'var(--bg-surface)', stroke: 'var(--primary)', strokeWidth: 3, r: 6 }}
                                activeDot={{ r: 8, fill: 'var(--accent)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                        <p>Log {TRACKED_EXERCISES.find(e => e.id === selectedEx)?.name} sets to see strength trends.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
