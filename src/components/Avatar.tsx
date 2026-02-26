import { motion } from 'framer-motion';

interface AvatarProps {
    level: number;
}

export function Avatar({ level }: AvatarProps) {
    // Cap the visual level at 100 for scaling purposes
    const visualLevel = Math.min(Math.max(level, 1), 100);

    // Calculate scaling factors:
    // Base shoulder width at level 1 is 1.0, scales up to 1.3 at level 100
    const shoulderWidth = 1.0 + (visualLevel * 0.003);
    // Base lat width at level 1 is 1.0, scales up to 1.25 at level 100
    const latWidth = 1.0 + (visualLevel * 0.0025);
    // Base arm thickness at level 1 is 1.0, scales up to 1.2 at level 100
    const armThickness = 1.0 + (visualLevel * 0.002);

    return (
        <div style={{ position: 'relative', width: '200px', height: '240px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
            <svg width="200" height="240" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0 }}>

                {/* Glow behind the avatar based on level */}
                <motion.ellipse
                    cx="100" cy="120" rx="80" ry="100"
                    fill="var(--primary)"
                    opacity={0.1 + (visualLevel * 0.0015)} // Varies from ~0.1 to 0.25
                    filter="blur(20px)"
                />

                {/* Head (remains static size) */}
                <circle cx="100" cy="40" r="22" fill="#E2E8F0" />

                {/* Core Torso (Slightly scales width) */}
                <motion.path
                    d="M85 80 L115 80 L110 180 L90 180 Z"
                    fill="#CBD5E1"
                />

                {/* Lats (The V-Taper, scales aggressively) */}
                <motion.path
                    d="M100 80 Q100 80 100 150 Q75 120 85 80 Z"
                    fill="#94A3B8"
                    animate={{ scaleX: latWidth }}
                    style={{ originX: 1, originY: 0.5 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />
                <motion.path
                    d="M100 80 Q100 80 100 150 Q125 120 115 80 Z"
                    fill="#94A3B8"
                    animate={{ scaleX: latWidth }}
                    style={{ originX: 0, originY: 0.5 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />

                {/* Shoulders & Chest (Scales outward) */}
                <motion.path
                    d="M65 80 Q100 65 135 80 L130 110 Q100 120 70 110 Z"
                    fill="#E2E8F0"
                    animate={{ scaleX: shoulderWidth }}
                    style={{ originX: 0.5, originY: 0.5 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />

                {/* Left Arm */}
                <motion.path
                    d="M65 85 Q50 95 55 150 L70 145 Z"
                    fill="#CBD5E1"
                    animate={{ scaleX: armThickness, translateX: -((shoulderWidth - 1) * 20) }}
                    style={{ originX: 1, originY: 0 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />

                {/* Right Arm */}
                <motion.path
                    d="M135 85 Q150 95 145 150 L130 145 Z"
                    fill="#CBD5E1"
                    animate={{ scaleX: armThickness, translateX: ((shoulderWidth - 1) * 20) }}
                    style={{ originX: 0, originY: 0 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                />

                {/* Accent lines to look tech/cyber */}
                <motion.path d="M100 80 L100 180" stroke="#0F172A" strokeWidth="2" strokeOpacity="0.2" />
                <motion.path d="M85 100 L115 100" stroke="#0F172A" strokeWidth="2" strokeOpacity="0.1" />

            </svg>

            {/* Level Badge Overlay */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'absolute',
                    bottom: '10px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    color: 'white',
                    padding: '0.2rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                LVL {level}
            </motion.div>
        </div>
    );
}
