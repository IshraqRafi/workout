import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, ChevronRight, Check, Moon, Apple, Zap } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useWorkout } from '../contexts/WorkoutContext';
import type { DailyWorkout } from '../data/workoutPlan';
import { workoutPlan } from '../data/workoutPlan';
import { calculateReadiness, calculateAthleteState } from '../utils/rpgLogic';
import { generateDynamicWorkout } from '../utils/aiCoach';
import { BreathingHalo } from '../components/BreathingHalo';

export function Workouts() {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const { getTodayWorkout, logWorkout, history } = useWorkout();
    const [workout, setWorkout] = useState<DailyWorkout | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // AI Check-in States
    const [checkinComplete, setCheckinComplete] = useState(false);
    const [sleepHours, setSleepHours] = useState(7);
    const [sleepMinutes, setSleepMinutes] = useState(0);
    const [dietText, setDietText] = useState("");

    // Determine if we are viewing a past/future date instead of "today"
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    const activeDateStr = date || todayStr;
    const isToday = activeDateStr === todayStr;
    const isPast = new Date(activeDateStr) < new Date(new Date().setHours(0, 0, 0, 0));

    // Find if this specific date is already in history
    const historyLog = history.find(h => h.date === activeDateStr);
    const isAlreadyLogged = !!historyLog;

    useEffect(() => {
        if (historyLog) {
            const basePlan = workoutPlan[historyLog.dayIndex];
            setWorkout({
                dayIndex: historyLog.dayIndex,
                title: basePlan.title,
                type: basePlan.type,
                progressionTip: basePlan.progressionTip,
                exercises: JSON.parse(JSON.stringify(historyLog.exercises))
            });
        } else if (date) {
            // Load a specific day's plan for preview
            const dayOfWeek = new Date(date).getDay();
            setWorkout(JSON.parse(JSON.stringify(workoutPlan[dayOfWeek])));
        } else {
            setWorkout(getTodayWorkout());
            setCheckinComplete(false); // Reset on load
        }
    }, [date, activeDateStr, history, historyLog, getTodayWorkout]);

    const handleToggleSet = (exerciseId: string, setId: string) => {
        if (!workout || !isToday) return; // Prevent edits if not today
        const updated = { ...workout };
        const ex = updated.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        const s = ex.sets.find(s => s.id === setId);
        if (!s) return;

        s.isCompleted = !s.isCompleted;
        // Auto-fill completed reps with target reps if checked and empty
        if (s.isCompleted && !s.completedReps) {
            s.completedReps = typeof s.targetReps === 'number' ? s.targetReps.toString() : s.targetReps;
        }

        setWorkout(updated);
    };

    const handleRepsChange = (exerciseId: string, setId: string, val: string) => {
        if (!workout || !isToday) return; // Prevent edits if not today
        const updated = { ...workout };
        const ex = updated.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        const s = ex.sets.find(s => s.id === setId);
        if (!s) return;

        s.completedReps = val;
        setWorkout(updated);
    };

    const handleAIStart = () => {
        if (!workout) return;
        const rpgState = calculateAthleteState(history as any);
        const readiness = calculateReadiness(history as any);
        const dynamicWorkout = generateDynamicWorkout(workout, sleepHours, sleepMinutes, dietText, readiness.score, history as any, rpgState.level);
        setWorkout(dynamicWorkout);
        setCheckinComplete(true);

        // Audio-Synthesized Coach Hype
        if (dynamicWorkout.aiNotes && 'speechSynthesis' in window) {
            // Cancel any ongoing speech so it doesn't pipeline
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(dynamicWorkout.aiNotes);
            utterance.rate = 1.05; // Slightly faster, more energetic
            utterance.pitch = 0.9; // Slightly deeper coach voice
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSubmit = () => {
        if (!workout || !isToday) return;
        logWorkout({
            date: activeDateStr,
            dayIndex: workout.dayIndex,
            exercises: workout.exercises
        });

        // Fire confetti!
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#10B981', '#3B82F6', '#FFFFFF']
        });

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 2000);
    };
    const totalSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;
    const completedSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0) || 0;
    const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    if (!workout) return null;

    if (isToday && !isAlreadyLogged && !checkinComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1rem', maxWidth: '600px', margin: '4rem auto', width: '100%' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="flex-center glass-pill" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(79, 70, 229, 0.1)', borderColor: 'var(--primary)' }}>
                        <Zap size={40} color="var(--primary)" />
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Pre-Workout Check-in</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Help the AI Coach tailor today's volume to your recovery state.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Moon color="var(--primary)" size={20} /> Total Sleep Last Night</span>
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <select
                                    value={sleepHours}
                                    onChange={e => setSleepHours(Number(e.target.value))}
                                    className="glass-pill"
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', color: 'white', padding: '0.75rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    {[...Array(13)].map((_, i) => (
                                        <option key={i} value={i} style={{ color: 'black' }}>{i} Hours</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <select
                                    value={sleepMinutes}
                                    onChange={e => setSleepMinutes(Number(e.target.value))}
                                    className="glass-pill"
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', color: 'white', padding: '0.75rem', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value={0} style={{ color: 'black' }}>0 Minutes</option>
                                    <option value={15} style={{ color: 'black' }}>15 Minutes</option>
                                    <option value={30} style={{ color: 'black' }}>30 Minutes</option>
                                    <option value={45} style={{ color: 'black' }}>45 Minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Apple color="var(--accent)" size={20} /> Describe Yesterday's Diet</span>
                        </label>
                        <textarea
                            value={dietText}
                            onChange={e => setDietText(e.target.value)}
                            placeholder="e.g. Had eggs for breakfast, chicken salad for lunch, but ordered a pizza for dinner..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                            onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)' }}
                        />
                    </div>

                    <button
                        onClick={handleAIStart}
                        className="glass-pill" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)' }}
                    >
                        Generate My Workout
                    </button>
                </div>
            </motion.div>
        );
    }

    if (showSuccess) {
        return (
            <div className="flex-center" style={{ height: '70vh', flexDirection: 'column' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="glass-pill flex-center"
                    style={{ width: '120px', height: '120px', padding: 0, borderRadius: '50%', background: 'var(--accent)', marginBottom: '2rem' }}
                >
                    <Check size={60} color="white" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}
                >
                    Workout Saved!
                </motion.h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Session data updated successfully.</p>
                <button onClick={() => { setShowSuccess(false); navigate(`/history/${activeDateStr}`); }} className="glass-pill" style={{ marginTop: '2rem', cursor: 'pointer' }}>View Log</button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Interactive Pump Background Overlay */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: workout.isBossFight
                        ? 'radial-gradient(circle at center, rgba(220, 38, 38, 0.25) 0%, transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
                animate={{
                    opacity: workout.isBossFight ? 1 : progressPercent / 100, // Fully opaque base on Boss Fight
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    scale: {
                        duration: workout.isBossFight ? 2 : 4, // Faster pulse on boss fight
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            />

            <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '6rem' }}>
                <header style={{ marginBottom: '3rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: workout.isBossFight ? '#EF4444' : 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>
                        <Flame size={20} />
                        <span>DAY {workout.dayIndex === 0 ? 7 : workout.dayIndex} {isAlreadyLogged ? '• EDITING LOG' : (isPast ? '• UNLOGGED' : (!isToday && '• PREVIEW'))}</span>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 800 }}>{workout.title}</h1>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: 500 }}>
                        {new Date(activeDateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{workout.type}</p>

                    {/* Progress Bar Container */}
                    <div style={{ marginTop: '2rem', background: 'var(--bg-surface)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'var(--accent)' }}
                        />
                    </div>
                </header>

                {/* AI Notes */}
                {workout.aiNotes && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', background: 'rgba(79, 70, 229, 0.05)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={18} /> AI Coach Adjustments
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{workout.aiNotes}</p>
                    </div>
                )}

                {/* Progression Tip */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', borderLeft: '4px solid var(--secondary)', background: 'rgba(236, 72, 153, 0.05)' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronRight size={18} color="var(--secondary)" /> Hypertrophy Tip
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{workout.progressionTip}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {workout.exercises.map((exercise, idx) => (
                        <motion.div
                            key={exercise.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '2rem' }}
                        >
                            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.2rem' }}>{exercise.name}</h3>
                                    {exercise.notes && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{exercise.notes}</p>}
                                </div>
                                {/* Render Tempo Visualizer only on actual exercise tracking days */}
                                {isToday && <BreathingHalo />}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Header row for sets */}
                                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px', gap: '1rem', padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <span style={{ textAlign: 'center' }}>Set</span>
                                    <span>Target</span>
                                    <span style={{ textAlign: 'center' }}>Reps Done</span>
                                </div>

                                {exercise.sets.map((set, setIdx) => (
                                    <div
                                        key={set.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '40px 1fr 100px 48px',
                                            gap: '1rem',
                                            padding: '1rem',
                                            background: set.isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-hover)',
                                            borderRadius: '12px',
                                            alignItems: 'center',
                                            border: set.isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ color: set.isCompleted ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>{setIdx + 1}</div>

                                        <div style={{ color: set.isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {set.targetReps}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="-"
                                            value={set.completedReps || ''}
                                            onChange={(e) => handleRepsChange(exercise.id, set.id, e.target.value)}
                                            readOnly={!isToday}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                textAlign: 'center',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                                opacity: isToday ? 1 : 0.5,
                                                cursor: isToday ? 'text' : 'not-allowed'
                                            }}
                                            onFocus={(e) => { if (isToday) e.target.style.borderColor = 'var(--primary)' }}
                                            onBlur={(e) => { if (isToday) e.target.style.borderColor = 'var(--border-subtle)' }}
                                        />

                                        <button
                                            onClick={() => handleToggleSet(exercise.id, set.id)}
                                            disabled={!isToday}
                                            style={{ background: 'none', border: 'none', cursor: isToday ? 'pointer' : 'not-allowed', padding: 0, display: 'flex', justifyContent: 'center', opacity: isToday ? 1 : 0.5 }}
                                        >
                                            {set.isCompleted ? (
                                                <CheckCircle2 size={32} color="var(--accent)" />
                                            ) : (
                                                <Circle size={32} color="var(--text-muted)" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {isToday && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleSubmit}
                            className="glass-pill"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent) 0%, #059669 100%)',
                                border: 'none',
                                padding: '1rem 3rem',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: 'white',
                                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            {isAlreadyLogged ? 'Update Workout' : 'Complete Workout'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
