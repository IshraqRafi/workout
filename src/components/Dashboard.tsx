import { motion } from 'framer-motion';
import { Activity, Flame, TrendingUp, Dumbbell, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';
import { calculateReadiness, calculateAthleteState } from '../utils/rpgLogic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { MuscleHeatmap } from './MuscleHeatmap';
import { ConsistencyMatrix } from './ConsistencyMatrix';
import { PRTrendlines } from './PRTrendlines';
import { AIFormCoach } from './AIFormCoach';
import { Avatar } from './Avatar';

export function Dashboard() {
    const { history, hasLoggedToday } = useWorkout();
    const navigate = useNavigate();

    // Get last logged workout exercises for muscle heatmap
    const lastLog = history.length > 0 ? [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
    const lastExercises = lastLog?.exercises ?? [];

    // Basic stats calculation based on history
    const workoutsThisWeek = history.filter(h => {
        const diff = Date.now() - new Date(h.date).getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Calculate total sets logged
    let totalVolumeSets = 0;
    history.forEach(log => {
        log.exercises.forEach(ex => {
            totalVolumeSets += ex.sets.filter(s => s.isCompleted).length;
        });
    });

    const rpgState = calculateAthleteState(history as any);
    const readiness = calculateReadiness(history as any);

    const stats = [
        { label: 'Daily Readiness', value: `${readiness.score}%`, icon: Zap, color: readiness.color },
        { label: 'Workouts this week', value: workoutsThisWeek.toString(), icon: Activity, color: 'var(--primary)' },
        { label: 'Current Streak', value: `${rpgState.currentStreak} Days`, icon: Flame, color: 'var(--secondary)' },
        { label: 'Total Sets Done', value: totalVolumeSets.toString(), icon: TrendingUp, color: 'var(--accent)' },
    ];

    // Process data for the chart (last 7 days of activity)
    // We'll map the history to show sets completed per day
    const chartData = [...history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7)
        .map(log => {
            const sets = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
            return {
                name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
                sets: sets,
                fullDate: log.date
            };
        });

    // If we don't have enough data, pad it a bit for visual aesthetic
    if (chartData.length < 3) {
        chartData.unshift({ name: 'Prev', sets: 0, fullDate: '' });
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-glow)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{label}</p>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>
                        {payload[0].value} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Sets</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '3rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Welcome back, Ishraq</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
                        <div className="glass-pill" style={{ background: 'rgba(79, 70, 229, 0.1)', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                            Lv. {rpgState.level} {rpgState.title}
                        </div>
                        <div style={{ width: '200px', height: '6px', background: 'var(--bg-surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(rpgState.currentLevelExp / rpgState.expToNext) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{rpgState.currentLevelExp} / {rpgState.expToNext} EXP</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        {hasLoggedToday ? "Great job crushing your workout today!" : "Ready to crush your goals today?"}
                    </p>
                </div>

                {/* Dynamic Auto-Scaling Physics Avatar */}
                <div style={{ flexShrink: 0 }}>
                    <Avatar level={rpgState.level} />
                </div>
            </header>

            {/* Main Two-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 380px)', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Stats & Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Stats Grid - Smaller and pushed left */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {stats.map((stat, i) => (
                            <motion.div key={i} variants={item} className="glass-panel" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                    <stat.icon size={80} color={stat.color} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div className="glass-pill" style={{ padding: '0.4rem', borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.03)' }}>
                                        <stat.icon size={20} color={stat.color} className={stat.label === 'Current Streak' && rpgState.currentStreak > 0 ? 'animate-pulse-glow' : ''} />
                                    </div>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>{stat.label}</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Animated Graph Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel"
                        style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Performance Activity</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sets completed over recent sessions</p>
                        </div>

                        <div style={{ width: '100%', height: '300px' }}>
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSets" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
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
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="sets"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSets)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                                    <p>Not enough data to display chart.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Recent Activity</h2>

                        {history.length === 0 ? (
                            <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-muted)', flex: 1 }}>
                                <Dumbbell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No workouts logged yet.</p>
                                <button
                                    onClick={() => navigate('/workouts')}
                                    className="glass-pill" style={{ marginTop: '1.5rem', cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}
                                >
                                    Start Workout
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                {[...history].reverse().slice(0, 5).map((log, i) => {
                                    const totalSets = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => navigate(`/history/${log.date}`)}
                                            className="glass-pill"
                                            style={{
                                                padding: '1.25rem',
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-surface-hover)';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-surface)';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
                                                    <CheckCircle2 size={24} color="var(--accent)" />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Day {log.dayIndex === 0 ? 7 : log.dayIndex} Session</h4>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.date}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{totalSets} Sets</div>
                                                <ChevronRight size={18} color="var(--text-muted)" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* Personal Records Tracking */}
                    <PRTrendlines history={history as any} />
                </div>

                {/* Right Column: Muscle Heatmap & AI Coach */}
                <div style={{ position: 'sticky', top: '1rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <MuscleHeatmap exercises={lastExercises} />
                    <AIFormCoach />
                </div>

            </div>

            {/* Bottom: 365 Day Consistency Matrix */}
            <ConsistencyMatrix history={history as any} />
        </div>
    );
}
