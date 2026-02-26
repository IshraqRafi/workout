import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise } from '../data/workoutPlan';
import Model from 'react-body-highlighter';
import type { IExerciseData, Muscle } from 'react-body-highlighter';

// --- Muscle Mappings for react-body-highlighter ---

const EXERCISE_MUSCLE_MAP: { keywords: string[]; muscles: Muscle[] }[] = [
    { keywords: ['push-up', 'pushup', 'push up', 'incline push', 'close-grip'], muscles: ['chest', 'triceps', 'front-deltoids'] },
    { keywords: ['pike push'], muscles: ['front-deltoids', 'triceps', 'upper-back'] },
    { keywords: ['pull-up', 'pullup', 'negative pull'], muscles: ['upper-back', 'biceps', 'trapezius'] },
    { keywords: ['row', 'dead hang'], muscles: ['upper-back', 'biceps', 'trapezius', 'lower-back'] },
    { keywords: ['squat', 'lunge'], muscles: ['quadriceps', 'gluteal', 'hamstring'] },
    { keywords: ['jump squat'], muscles: ['quadriceps', 'gluteal', 'calves'] },
    { keywords: ['glute bridge'], muscles: ['gluteal', 'hamstring'] },
    { keywords: ['calf raise'], muscles: ['calves'] },
    { keywords: ['plank', 'dead bug', 'hollow hold', 'leg raise'], muscles: ['abs', 'lower-back'] },
    { keywords: ['mountain climber'], muscles: ['abs', 'quadriceps', 'front-deltoids'] },
    { keywords: ['side plank'], muscles: ['obliques', 'abs'] },
    { keywords: ['shoulder tap'], muscles: ['front-deltoids', 'abs'] },
];

function getMusclesForExercise(name: string): Muscle[] {
    const lower = name.toLowerCase();
    for (const entry of EXERCISE_MUSCLE_MAP) {
        if (entry.keywords.some(kw => lower.includes(kw))) return entry.muscles;
    }
    return [];
}

// Convert sets to an intensity bucket (1 to 4) mapping to our colors
function getIntensityBucket(sets: number): number {
    if (sets >= 8) return 4; // Extreme (requires rest)
    if (sets >= 5) return 3; // High
    if (sets >= 2) return 2; // Moderate
    if (sets === 1) return 1; // Light
    return 0;
}

function computeHeatmapData(exercises: Exercise[]): IExerciseData[] {
    const counts: Partial<Record<Muscle, number>> = {};
    exercises.forEach(ex => {
        const completedSets = ex.sets.filter(s => s.isCompleted).length;
        if (completedSets === 0) return;
        const muscles = getMusclesForExercise(ex.name);
        muscles.forEach(m => {
            counts[m] = (counts[m] || 0) + completedSets;
        });
    });

    const data: IExerciseData[] = [];
    for (const [m, count] of Object.entries(counts)) {
        const bucket = getIntensityBucket(count as number);
        if (bucket > 0) {
            data.push({ name: `Session Data`, muscles: [m as Muscle], frequency: bucket });
        }
    }
    return data;
}

// --- Suggestion logic ---
function buildSuggestions(data: IExerciseData[]): string[] {
    const suggestions: string[] = [];

    const highIntensity = data.filter(d => (d.frequency || 0) >= 3).map(d => d.muscles[0]);
    const modIntensity = data.filter(d => (d.frequency || 0) === 2).map(d => d.muscles[0]);
    const worked = data.map(d => d.muscles[0]);

    // Format strings
    const format = (m: string) => m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (highIntensity.length > 0) {
        suggestions.push(`🔴 High intensity on ${highIntensity.map(format).join(', ')} — prioritize 48h rest for these groups.`);
    }

    if (modIntensity.length > 0) {
        suggestions.push(`🟡 Moderate load on ${modIntensity.map(format).join(', ')} — active recovery is fine tomorrow.`);
    }

    const coreMuscles: Muscle[] = ['chest', 'upper-back', 'abs', 'quadriceps', 'hamstring'];
    const notWorked = coreMuscles.filter(m => !worked.includes(m));

    if (notWorked.length > 0 && worked.length > 0) {
        suggestions.push(`💡 Untrained core areas: ${notWorked.slice(0, 3).map(format).join(', ')} — consider targeting them next.`);
    }

    if (worked.length === 0) {
        suggestions.push('🟢 No logged data yet. Complete a workout to see your muscle heatmap!');
    }

    return suggestions;
}

interface MuscleHeatmapProps {
    exercises: Exercise[];
}

export function MuscleHeatmap({ exercises }: MuscleHeatmapProps) {
    const data = computeHeatmapData(exercises);
    const suggestions = buildSuggestions(data);
    const hasData = exercises.length > 0;

    // 4 levels of intensity mapped to the frequency buckets (1 => light, 4 => extreme)
    const highlightedColors = [
        'rgba(234,179,8,0.7)',  // frequency 1: Yellow
        'rgba(249,115,22,0.8)', // frequency 2: Orange
        'rgba(239,68,68,0.9)',  // frequency 3: Red
        'rgba(220,38,38,1.0)',  // frequency 4: Dark Red
    ];

    const intensityLegend = [
        { color: 'rgba(239,68,68,0.9)', label: 'High (rest needed)' },
        { color: 'rgba(249,115,22,0.8)', label: 'Moderate' },
        { color: 'rgba(234,179,8,0.7)', label: 'Light' },
        { color: 'rgba(255,255,255,0.2)', label: 'Untrained' },
    ];

    const [hovered, setHovered] = useState<{ muscle: string; label: string; color: string } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleHover = (ex: any) => {
            if (!ex || !ex.muscle) return;
            const muscleName = ex.muscle.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            let label = 'Untrained';
            let color = 'rgba(255,255,255,0.4)';

            if (ex.data && ex.data.frequency > 0) {
                const freq = ex.data.frequency;
                if (freq >= 3) { label = 'High (rest needed)'; color = 'rgba(239,68,68,0.9)'; }
                else if (freq === 2) { label = 'Moderate Load'; color = 'rgba(249,115,22,0.8)'; }
                else if (freq === 1) { label = 'Light Work'; color = 'rgba(234,179,8,0.7)'; }
            }

            setHovered({ muscle: muscleName, label, color });
        };

        const handleLeave = () => {
            setHovered(null);
        };

        (window as any).__onMuscleHover = handleHover;
        (window as any).__onMuscleLeave = handleLeave;

        return () => {
            delete (window as any).__onMuscleHover;
            delete (window as any).__onMuscleLeave;
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel relative-container"
            onMouseMove={handleMouseMove}
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}
        >
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'fixed',
                            left: mousePos.x + 15,
                            top: mousePos.y + 15,
                            pointerEvents: 'none',
                            zIndex: 100,
                            background: 'rgba(15, 15, 20, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${hovered.color}`,
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 15px ${hovered.color.replace('0.9', '0.2').replace('0.8', '0.2').replace('0.7', '0.2')}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }}
                    >
                        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{hovered.muscle}</span>
                        <span style={{ fontSize: '0.8rem', color: hovered.color, fontWeight: 500 }}>{hovered.label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>Muscle Heatmap</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {hasData ? 'Last session • Recovery zones' : 'Log a workout to activate'}
                </p>
            </div>

            {/* Body Views using react-body-highlighter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Front</p>
                    <div style={{ width: '120px', height: '240px' }}>
                        <Model
                            data={data}
                            style={{ width: '100%', padding: 0 }}
                            type="anterior"
                            highlightedColors={highlightedColors}
                            bodyColor="rgba(255,255,255,0.05)"
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Back</p>
                    <div style={{ width: '120px', height: '240px' }}>
                        <Model
                            data={data}
                            style={{ width: '100%', padding: 0 }}
                            type="posterior"
                            highlightedColors={highlightedColors}
                            bodyColor="rgba(255,255,255,0.05)"
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                {intensityLegend.map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{l.label}</span>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

            {/* Suggestions */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Recovery Suggestions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {suggestions.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            style={{
                                padding: '0.7rem 1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                            }}
                        >
                            {s}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
