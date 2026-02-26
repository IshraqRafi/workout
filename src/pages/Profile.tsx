import { User, CreditCard, LogOut, Flame, Trophy, Target, Shield, Zap, TrendingUp, Medal, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../contexts/WorkoutContext';
import { calculateAthleteState } from '../utils/rpgLogic';
import { Avatar } from '../components/Avatar';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Model from 'react-body-highlighter';

export function Profile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { history } = useWorkout();

    // Logic Initialization
    const rpgState = calculateAthleteState(history as any);

    // Radar Chart Data processing (Cumulative Volume per Axis)
    let pullSets = 0, pushSets = 0, legSets = 0, coreSets = 0;
    history.forEach(log => {
        log.exercises.forEach(ex => {
            const numSets = ex.sets.filter(s => s.isCompleted).length;
            const t = ex.name.toLowerCase();
            if (t.includes('pull') || t.includes('row')) pullSets += numSets;
            else if (t.includes('push') || t.includes('dip')) pushSets += numSets;
            else if (t.includes('squat') || t.includes('lunge') || t.includes('calf')) legSets += numSets;
            else if (t.includes('plank') || t.includes('raise') || t.includes('core')) coreSets += numSets;
        });
    });

    // Normalize max for radar scaling to look cool even early on
    const maxSets = Math.max(pullSets, pushSets, legSets, coreSets, 10);

    const radarData = [
        { subject: 'Pulling Power', A: pullSets, fullMark: maxSets },
        { subject: 'Pushing Force', A: pushSets, fullMark: maxSets },
        { subject: 'Leg Hypertrophy', A: legSets, fullMark: maxSets },
        { subject: 'Core Stability', A: coreSets, fullMark: maxSets },
    ];

    // Trophy Unlock Logic
    const hasWeekStreak = rpgState.currentStreak >= 7;
    const hasMonthStreak = rpgState.currentStreak >= 30;
    const hasBeatenBoss = history.some(log => log.date.includes('boss') || rpgState.level >= 5); // Rough proxy for boss completion
    const has100Sets = (pullSets + pushSets + legSets + coreSets) >= 100;

    const trophies = [
        { icon: Flame, name: "7-Day Warrior", description: "Maintain a 7-day streak.", unlocked: hasWeekStreak, color: "#F97316" },
        { icon: Target, name: "Iron Will", description: "Maintain a 30-day streak.", unlocked: hasMonthStreak, color: "#EF4444" },
        { icon: Shield, name: "Boss Slayer", description: "Defeat your first Level 5 Trial.", unlocked: hasBeatenBoss, color: "#8B5CF6" },
        { icon: Zap, name: "Century Club", description: "Complete 100 total sets.", unlocked: has100Sets, color: "#EAB308" },
        { icon: TrendingUp, name: "Unstoppable", description: "Reach Level 10.", unlocked: rpgState.level >= 10, color: "#10B981" },
        { icon: Medal, name: "Gravity Defier", description: "Reach Level 20.", unlocked: rpgState.level >= 20, color: "#3B82F6" },
    ];

    // Lifetime Muscle Heatmap Logic
    const muscleCounts: Record<string, number> = {};
    const extractMuscles = (name: string): string[] => {
        const lower = name.toLowerCase();
        let m: string[] = [];
        if (lower.includes('push')) m = ['chest', 'front-deltoids', 'triceps'];
        else if (lower.includes('pull') || lower.includes('row')) m = ['upper-back', 'biceps', 'lats']; // Native lats may fail, using upper-back
        else if (lower.includes('squat') || lower.includes('lunge')) m = ['quadriceps', 'gluteal'];
        else if (lower.includes('calf')) m = ['calves'];
        else if (lower.includes('plank') || lower.includes('core')) m = ['abs', 'obliques'];
        return m;
    };

    history.forEach(log => {
        log.exercises.forEach(ex => {
            const completed = ex.sets.filter(s => s.isCompleted).length;
            if (completed > 0) {
                const targets = extractMuscles(ex.name);
                targets.forEach(t => {
                    muscleCounts[t] = (muscleCounts[t] || 0) + completed;
                });
            }
        });
    });

    const lifetimeHeatmapData = Object.entries(muscleCounts).map(([muscle, count]) => {
        let intensity = 1;
        if (count > 20) intensity = 4;
        else if (count > 10) intensity = 3;
        else if (count > 5) intensity = 2;
        return { name: "Lifetime Volume", muscles: [muscle as any], frequency: intensity };
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>

            {/* Holographic Player Card Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: 'relative', overflow: 'hidden', padding: '3rem', marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '24px',
                    boxShadow: '0 0 50px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(99, 102, 241, 0.1)',
                    display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap'
                }}
            >
                {/* Hologram Overlay Effect */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 92, 246, 0.05) 2px, rgba(139, 92, 246, 0.05) 4px)', pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.5 }} />

                <div style={{ position: 'relative', zIndex: 1, width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ transform: 'scale(0.85) translateY(-10px)', transformOrigin: 'center' }}>
                        <Avatar level={rpgState.level} />
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ishraq Rafi</h1>
                        <span className="glass-pill" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD', border: '1px solid rgba(139, 92, 246, 0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                            <Star size={16} fill="currentColor" /> Pro Tier
                        </span>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary)' }}>Level {rpgState.level}</span> • {rpgState.title}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Streak</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}><Flame size={20} /> {rpgState.currentStreak} Days</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lifetime Sets Check-ins</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{pullSets + pushSets + legSets + coreSets} Sets</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '3rem', marginBottom: '3rem' }}>

                {/* Career Stats Radar */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Target size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Career Stat Distribution</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', marginBottom: '2rem' }}>Visualizing your total volume balance across major movement axes.</p>

                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, maxSets]} tick={false} axisLine={false} />
                                <Radar name="Volume" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Lifetime Anatomy Heatmap */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Flame size={24} color="var(--accent)" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Lifetime Muscle Density</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', marginBottom: '2rem' }}>All-time aggregate of your muscular engagement.</p>

                    <div style={{ display: 'flex', gap: '2rem', height: '350px', width: '100%', justifyContent: 'center' }}>
                        <div style={{ height: '100%', width: '40%' }}>
                            <Model
                                data={lifetimeHeatmapData}
                                style={{ width: '100%', height: '100%' }}
                                highlightedColors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0.8)", "#10B981"]}
                                type="anterior"
                            />
                        </div>
                        <div style={{ height: '100%', width: '40%' }}>
                            <Model
                                data={lifetimeHeatmapData}
                                style={{ width: '100%', height: '100%' }}
                                highlightedColors={["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.5)", "rgba(16, 185, 129, 0.8)", "#10B981"]}
                                type="posterior"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Trophy Cabinet */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Trophy size={24} color="#F59E0B" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trophy Cabinet</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>Achievements unlocked across your journey.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {trophies.map((trophy, idx) => (
                        <div key={idx} style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: trophy.unlocked ? `radial-gradient(circle at center, ${trophy.color}15 0%, rgba(255,255,255,0.02) 100%)` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${trophy.unlocked ? `${trophy.color}40` : 'rgba(255,255,255,0.05)'}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                            opacity: trophy.unlocked ? 1 : 0.4,
                            filter: trophy.unlocked ? 'none' : 'grayscale(100%)',
                            boxShadow: trophy.unlocked ? `0 0 20px ${trophy.color}10` : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%', marginBottom: '1rem',
                                background: trophy.unlocked ? `${trophy.color}20` : 'rgba(255,255,255,0.05)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                border: `2px solid ${trophy.unlocked ? trophy.color : 'transparent'}`
                            }}>
                                <trophy.icon size={32} color={trophy.unlocked ? trophy.color : 'var(--text-muted)'} />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: trophy.unlocked ? '#fff' : 'var(--text-muted)', marginBottom: '0.25rem' }}>{trophy.name}</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{trophy.description}</p>

                            {trophy.unlocked && <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: trophy.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unlocked</div>}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Legacy Settings Block */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button className="glass-panel flex-center" style={{ flex: 1, padding: '1rem', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <CreditCard size={18} color="var(--primary)" /> Billing Settings
                </button>
                <button className="glass-panel flex-center" style={{ flex: 1, padding: '1rem', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <User size={18} color="var(--primary)" /> Edit Profile
                </button>
                <button onClick={handleLogout} className="glass-panel flex-center" style={{ flex: 1, padding: '1rem', gap: '0.5rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
                    <LogOut size={18} /> Sign Out
                </button>
            </div>

        </div>
    );
}
