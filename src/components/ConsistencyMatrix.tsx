import { motion } from 'framer-motion';
import type { DetailedWorkoutLog } from '../contexts/WorkoutContext';

export function ConsistencyMatrix({ history }: { history: DetailedWorkoutLog[] }) {
    // Generate last 365 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    // Create a map of date string (YYYY-MM-DD) to sets completed
    const dateMap = new Map<string, number>();
    history.forEach(log => {
        const sets = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
        dateMap.set(log.date, sets);
    });

    const weeks = [];
    let currentWeek = [];

    // Pad the first week to align with Sunday
    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
        currentWeek.push(null);
    }

    // Fill days
    for (let i = 0; i < 365; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const count = dateMap.get(dateStr) || 0;
        currentWeek.push({ dateStr, count });

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    const getColor = (count: number) => {
        if (count === 0) return 'rgba(255, 255, 255, 0.05)';
        if (count < 5) return 'rgba(79, 70, 229, 0.4)';
        if (count < 15) return 'rgba(79, 70, 229, 0.7)';
        return 'rgba(79, 70, 229, 1)';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', marginTop: '2rem' }}
        >
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Consistency Matrix</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>365-day workout contribution graph</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Less</span>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255, 255, 255, 0.05)' }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(79, 70, 229, 0.4)' }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(79, 70, 229, 0.7)' }} />
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(79, 70, 229, 1)' }} />
                    <span>More</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {week.map((day, dIdx) => (
                            <div
                                key={dIdx}
                                title={day ? `${day.count} Sets on ${day.dateStr}` : ''}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '3px',
                                    background: day ? getColor(day.count) : 'transparent',
                                    cursor: day && day.count > 0 ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (day && day.count > 0) {
                                        e.currentTarget.style.transform = 'scale(1.2)';
                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(79, 70, 229, 0.8)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (day && day.count > 0) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
