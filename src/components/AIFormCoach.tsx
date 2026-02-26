import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Activity, CheckCircle2, AlertTriangle, ScanLine } from 'lucide-react';

export function AIFormCoach() {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');

    const handleMockUpload = () => {
        setStatus('uploading');
        setTimeout(() => setStatus('analyzing'), 1500);
        setTimeout(() => setStatus('done'), 4500);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', marginTop: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity color="var(--primary)" /> AI Form Coach <span className="glass-pill" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', borderColor: 'transparent' }}>BETA</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload your workout video for instant biomechanics feedback</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleMockUpload}
                        style={{ border: '2px dashed var(--border-strong)', borderRadius: '12px', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                        <UploadCloud size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ fontWeight: 600 }}>Click or drag a video to analyze</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Supports MP4, MOV (Max 50MB)</p>
                    </motion.div>
                )}

                {(status === 'uploading' || status === 'analyzing') && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}
                    >
                        <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '2rem' }}>
                            {/* Dummy pulsing elements to simulate AI processing */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', border: '2px solid var(--primary)' }}
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                                style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', borderTop: '2px solid var(--secondary)', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', borderRight: '2px solid transparent' }}
                            />
                            <div className="flex-center" style={{ width: '100%', height: '100%' }}>
                                <ScanLine size={48} color="var(--primary)" />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{status === 'uploading' ? 'Uploading Video...' : 'Running Pose Estimation Model...'}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{status === 'analyzing' ? 'Mapping skeletal geometry...' : 'Please wait'}</p>
                    </motion.div>
                )}

                {status === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <CheckCircle2 color="var(--accent)" size={24} style={{ flexShrink: 0 }} />
                            <div>
                                <h4 style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '0.2rem' }}>Push-up Depth is Excellent</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your chest is reaching optimal depth (95% ROM computed). Great stretch on the pecs.</p>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <AlertTriangle color="var(--danger)" size={24} style={{ flexShrink: 0 }} />
                            <div>
                                <h4 style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.2rem' }}>Hips Dropping (Core Instability)</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Detected a 15-degree sag in your lumbar spine during the concentric phase. Squeeze your glutes and brace your core tighter.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setStatus('idle')}
                            className="glass-pill" style={{ alignSelf: 'center', marginTop: '1rem', background: 'var(--bg-surface-hover)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            Analyze Another Video
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
