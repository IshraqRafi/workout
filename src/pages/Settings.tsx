import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ShieldAlert, Cpu, HardDrive, Volume2, Globe, Sparkles, AlertTriangle } from 'lucide-react';

export function Settings() {
    // Local state for the gamified settings
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [hardcoreMode, setHardcoreMode] = useState(false);
    const [activeTheme, setActiveTheme] = useState<'cyberpunk' | 'paladin' | 'void'>('cyberpunk');
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(100);

    // Simulate Fake Cloud Sync
    const handleSync = () => {
        if (syncing) return;
        setSyncing(true);
        setSyncProgress(0);

        // Fake progress interval
        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setSyncing(false);
                    return 100;
                }
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 500);
    };

    // Toggle Handlers
    const toggleHardcore = () => setHardcoreMode(!hardcoreMode);
    const toggleAudio = () => setAudioEnabled(!audioEnabled);

    // Theme definitions for UI mapping
    const themes = [
        { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon & Dark', colorCode: '#6366f1', activeBg: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' },
        { id: 'paladin', name: 'Paladin', desc: 'Light & Gold', colorCode: '#F59E0B', activeBg: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(252,211,77,0.2))' },
        { id: 'void', name: 'Void', desc: 'Deep Black', colorCode: '#000000', activeBg: 'linear-gradient(135deg, rgba(30,30,30,0.8), rgba(10,10,10,0.9))' },
    ];

    return (
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>

            <header style={{ marginBottom: '3rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                    <SettingsIcon size={32} color="var(--primary)" />
                </div>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>System HUD</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Configuration Control Center</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '2rem' }}>

                {/* Main Settings Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* RPG Thematic Selectors */}
                    <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Sparkles size={20} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Aesthetic Core</h3>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {themes.map(theme => (
                                <div
                                    key={theme.id}
                                    onClick={() => setActiveTheme(theme.id as any)}
                                    style={{
                                        padding: '1.5rem', borderRadius: '12px', cursor: 'pointer',
                                        background: activeTheme === theme.id ? theme.activeBg : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${activeTheme === theme.id ? theme.colorCode : 'rgba(255,255,255,0.05)'}`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: activeTheme === theme.id ? `0 0 20px ${theme.colorCode}20` : 'none'
                                    }}
                                >
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.colorCode, border: '2px solid rgba(255,255,255,0.2)', boxShadow: activeTheme === theme.id ? `0 0 10px ${theme.colorCode}` : 'none' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: activeTheme === theme.id ? '#fff' : 'var(--text-secondary)' }}>{theme.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{theme.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Hardware & Feedback Toggles */}
                    <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Cpu size={20} color="var(--secondary)" />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Sensory Feedback</h3>
                        </div>
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>

                            {/* Audio Toggle */}
                            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                        <Volume2 size={20} color={audioEnabled ? "var(--accent)" : "var(--text-muted)"} />
                                        Haptic Audio Clicks
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '2.2rem' }}>Mechanical sound effects on navigation.</div>
                                </div>
                                {/* Custom Switch */}
                                <div onClick={toggleAudio} style={{ width: '50px', height: '26px', background: audioEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease' }}>
                                    <motion.div
                                        animate={{ x: audioEnabled ? 26 : 2 }}
                                        transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                        style={{ width: '22px', height: '22px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                        <Globe size={20} color="var(--primary)" />
                                        Regional Server Layer
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '2.2rem' }}>Data routing optimization.</div>
                                </div>
                                <span style={{ color: 'var(--primary)', fontWeight: 700, background: 'rgba(99,102,241,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px' }}>US-EAST (Primary)</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Hardcore Mode Danger Zone */}
                    <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <ShieldAlert size={20} color="#EF4444" />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Danger Zone</h3>
                        </div>
                        <div style={{
                            padding: '1.5rem', borderRadius: '16px',
                            background: hardcoreMode ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                            border: `2px solid ${hardcoreMode ? '#EF4444' : 'rgba(239, 68, 68, 0.2)'}`,
                            boxShadow: hardcoreMode ? 'inset 0 0 30px rgba(239, 68, 68, 0.1), 0 0 20px rgba(239, 68, 68, 0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.5rem' }}>
                                    <AlertTriangle size={24} />
                                    Enable Hardcore Mode
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.5 }}>
                                    Locks the ability to skip workouts or edit past history entries. If you miss a day, your streak permanently ends.
                                </div>
                            </div>

                            <div onClick={toggleHardcore} style={{ width: '60px', height: '32px', background: hardcoreMode ? '#EF4444' : 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', position: 'relative', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <motion.div
                                    animate={{ x: hardcoreMode ? 30 : 2 }}
                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                    style={{ width: '26px', height: '26px', background: hardcoreMode ? '#fff' : 'rgba(239, 68, 68, 0.5)', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: hardcoreMode ? '0 0 10px #EF4444' : 'none' }}
                                />
                            </div>
                        </div>
                    </motion.section>

                </div>

                {/* Sidebar Sync Status Column */}
                <div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'sticky', top: '2rem' }}>
                        <HardDrive size={48} color={syncProgress === 100 ? 'var(--primary)' : 'var(--accent)'} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Neural Link Sync</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Synchronizing your RPG stat blocks, workout plans, and user history to the central mainframe.
                        </p>

                        {/* Progress Bar Container */}
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <motion.div
                                animate={{ width: `${Math.min(syncProgress, 100)}%` }}
                                transition={{ duration: 0.2 }}
                                style={{ height: '100%', background: syncProgress === 100 ? 'var(--primary)' : 'var(--accent)', borderRadius: '4px', boxShadow: `0 0 10px ${syncProgress === 100 ? 'var(--primary)' : 'var(--accent)'}` }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            <span>{syncProgress === 100 ? 'ONLINE' : 'UPLOADING...'}</span>
                            <span>{Math.min(syncProgress, 100)}%</span>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="glass-pill"
                            style={{
                                width: '100%', padding: '1rem', fontWeight: 700,
                                background: syncing ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.1)',
                                border: syncing ? 'none' : '1px solid rgba(99, 102, 241, 0.3)',
                                color: syncing ? 'var(--text-muted)' : 'var(--primary)',
                                cursor: syncing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {syncing ? 'Establishing Uplink...' : 'Force Manual Sync'}
                        </button>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Last Sync:</span>
                            <span>{syncProgress === 100 ? '2 Minutes Ago' : 'Pending...'}</span>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
