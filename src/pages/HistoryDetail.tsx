import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../contexts/WorkoutContext';
import { Flame, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function HistoryDetail() {
    const { date } = useParams<{ date: string }>();
    const { history } = useWorkout();
    const navigate = useNavigate();

    const workoutLog = history.find(h => h.date === date);

    if (!workoutLog) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Workout record not found.</p>
                <button onClick={() => navigate('/')} className="glass-pill" style={{ cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
        );
    }

    const totalSetsCompleted = workoutLog.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    className="glass-pill"
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)'
                    }}
                >
                    <ArrowLeft size={18} />
                    <span>Back</span>
                </button>
                <button
                    onClick={() => navigate(`/workouts/${date}`)}
                    className="glass-pill"
                    style={{
                        cursor: 'pointer',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(99, 102, 241, 0.3)'
                    }}
                >
                    Edit Session
                </button>
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>
                    <Flame size={20} />
                    <span>DAY {workoutLog.dayIndex === 0 ? 7 : workoutLog.dayIndex} • COMPLETED</span>
                </div>
                <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800 }}>Workout Log</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{new Date(workoutLog.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1rem 1.5rem', flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sets Completed</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{totalSetsCompleted}</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {workoutLog.exercises.map((exercise, idx) => {
                    const completedSets = exercise.sets.filter(s => s.isCompleted);
                    if (completedSets.length === 0) return null; // Only show exercises that had completed sets

                    return (
                        <motion.div
                            key={exercise.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '1.5rem' }}
                        >
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: 'white' }}>{exercise.name}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {completedSets.map((set, setIdx) => (
                                    <div
                                        key={set.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <CheckCircle2 size={18} color="var(--accent)" />
                                            <span style={{ color: 'var(--text-muted)' }}>Set {setIdx + 1}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target</span>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{set.targetReps}</span>
                                            </div>
                                            <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Done</span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{set.completedReps || set.targetReps}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
