import { motion } from 'framer-motion';

export function BreathingHalo() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Static Core */}
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', zIndex: 10 }} />

                {/* Breathing Halo */}
                <motion.div
                    animate={{
                        scale: [1, 2.5, 2.5, 1],
                        opacity: [0.8, 0.2, 0.2, 0.8]
                    }}
                    transition={{
                        duration: 5,
                        times: [0, 0.6, 0.8, 1], // 3s expand (0-60%), 1s hold (60-80%), 1s contract (80-100%)
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        zIndex: 1
                    }}
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', lineHeight: 1 }}>Hypertrophy Tempo</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>3s Down • 1s Hold • 1s Up</span>
            </div>
        </div>
    );
}
