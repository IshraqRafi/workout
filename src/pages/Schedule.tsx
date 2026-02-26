import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dumbbell, Activity, Flame, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { workoutPlan } from '../data/workoutPlan';
import { useWorkout } from '../contexts/WorkoutContext';

export function Schedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const navigate = useNavigate();
    const { history } = useWorkout();

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const days = [];
    // Pad empty days at start of month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentYear, currentMonth, i));
    }

    // Find workout info for a specific date
    const getWorkoutForDate = (date: Date) => {
        const dayOfWeek = date.getDay();
        const plannedWorkout = workoutPlan[dayOfWeek];

        // Format date string explicitly in local time to avoid UTC shift bugs
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const isCompleted = history.some(log => log.date === dateStr);

        return { plannedWorkout, isCompleted, dateStr };
    };

    // Determine icon based on workout type
    const getWorkoutIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) return <CheckCircle2 size={16} color="var(--accent)" />;
        if (type === 'Rest' || type === 'Active Recovery') return <Activity size={16} color="var(--text-muted)" />;
        if (type === 'Strength') return <Dumbbell size={16} color="var(--primary)" />;
        return <Flame size={16} color="var(--secondary)" />;
    };

    // Hover Panel Content
    const renderHoverPanel = () => {
        if (!hoveredDate) return null;

        const { plannedWorkout, isCompleted, dateStr } = getWorkoutForDate(hoveredDate);
        const isToday = new Date().toDateString() === hoveredDate.toDateString();
        const isPast = hoveredDate < new Date(new Date().setHours(0, 0, 0, 0));

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel"
                style={{ padding: '1.5rem', height: '100%', position: 'sticky', top: '1rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CalendarIcon size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{hoveredDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                </div>

                {isCompleted ? (
                    <div className="glass-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
                        <CheckCircle2 size={16} /> Session Completed
                    </div>
                ) : isPast ? (
                    <div className="glass-pill" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Missed / Unlogged Session
                    </div>
                ) : (
                    <div className="glass-pill" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '1.5rem' }}>
                        {plannedWorkout.type}
                    </div>
                )}

                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plannedWorkout.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    {plannedWorkout.progressionTip}
                </p>

                {plannedWorkout.title !== 'Rest Day' && (
                    <div>
                        <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Exercises</h5>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {plannedWorkout.exercises.map((ex, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                    <span>{ex.name}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{ex.sets.length} sets</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={() => {
                        if (isCompleted) {
                            navigate(`/history/${dateStr}`);
                        } else {
                            navigate(`/workouts/${dateStr}`);
                        }
                    }}
                    className="glass-pill"
                    style={{ width: '100%', marginTop: '2rem', cursor: 'pointer', background: isCompleted ? 'transparent' : 'var(--primary)', color: isCompleted ? 'var(--text-primary)' : 'white', border: isCompleted ? '1px solid var(--border-strong)' : 'none' }}
                >
                    {isCompleted ? 'View Log' : isPast ? 'View Workout (Read Only)' : isToday ? 'Start Workout' : 'Preview Workout'}
                </button>
            </motion.div>
        );
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Schedule</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Plan your week and track your consistency.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>
                {/* Calendar Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>

                    {/* Calendar Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{monthNames[currentMonth]} {currentYear}</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="glass-pill flex-center" onClick={prevMonth} style={{ width: '40px', height: '40px', padding: 0, cursor: 'pointer' }}>
                                <ChevronLeft size={20} />
                            </button>
                            <button className="glass-pill flex-center" onClick={nextMonth} style={{ width: '40px', height: '40px', padding: 0, cursor: 'pointer' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Labels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                        {days.map((date, index) => {
                            if (!date) return <div key={`empty-${index}`} />;

                            const { plannedWorkout, isCompleted, dateStr } = getWorkoutForDate(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isHovered = hoveredDate?.toDateString() === date.toDateString();

                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onMouseEnter={() => setHoveredDate(date)}
                                    onClick={() => {
                                        if (isCompleted) navigate(`/history/${dateStr}`);
                                        else navigate(`/workouts/${dateStr}`);
                                    }}
                                    style={{
                                        aspectRatio: '1',
                                        background: isToday ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${isHovered ? 'var(--primary)' : isToday ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-subtle)'}`,
                                        borderRadius: '12px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        transition: 'border 0.2s ease, background 0.2s ease'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '1.1rem',
                                        fontWeight: isToday ? 700 : 500,
                                        color: isToday ? 'var(--primary)' : 'var(--text-primary)'
                                    }}>
                                        {date.getDate()}
                                    </span>

                                    <div style={{ opacity: isPast(date) && !isCompleted ? 0.3 : 1 }}>
                                        {getWorkoutIcon(plannedWorkout.type, isCompleted)}
                                    </div>

                                    {/* Subtle dot for planned intensity */}
                                    {!isCompleted && plannedWorkout.title !== 'Rest Day' && (
                                        <div style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: plannedWorkout.type === 'Strength' ? 'var(--primary)' : 'var(--secondary)',
                                            position: 'absolute',
                                            bottom: '6px'
                                        }} />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Hover/Detail Sidebar */}
                <div style={{ minHeight: '400px' }}>
                    <AnimatePresence mode="wait">
                        {hoveredDate ? (
                            <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
                                {renderHoverPanel()}
                            </motion.div>
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-panel flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                                <CalendarIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Hover over a day to see<br />workout details.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Helper
function isPast(date: Date) {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
}
