import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Lock, User, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const success = await login(username, password);

        if (success) {
            navigate('/');
        } else {
            setError('Invalid username or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', width: '100%', padding: '1rem', position: 'relative', overflow: 'hidden' }}>

            {/* Background Graphic Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.4, 0.3],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    opacity: 0.1,
                    zIndex: 0,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '3rem',
                    position: 'relative',
                    zIndex: 10,
                }}
            >
                <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2.5rem' }}>
                    <div className="glass-pill flex-center" style={{ width: '64px', height: '64px', padding: 0, marginBottom: '1.5rem', border: '1px solid var(--border-glow)' }}>
                        <Target size={32} color="var(--primary)" />
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Warkout HQ</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to track your progress</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '-0.5rem' }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className="glass-pill"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1rem',
                            background: isLoading ? 'var(--bg-surface)' : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            border: 'none',
                            cursor: (isLoading || !username || !password) ? 'not-allowed' : 'pointer',
                            opacity: (isLoading || !username || !password) ? 0.7 : 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Flame size={20} color="white" />
                            </motion.div>
                        ) : (
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>Enter Dashboard</span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
