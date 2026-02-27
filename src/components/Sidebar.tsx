import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, Calendar, User as UserIcon, Settings, Flame, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { icon: Activity, label: 'Dashboard', path: '/' },
    { icon: Dumbbell, label: 'Workouts', path: '/workouts' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    const [showLogout, setShowLogout] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Sidebar Container */}
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="sidebar-desktop glass-panel"
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    bottom: '1rem',
                    width: '260px',
                    zIndex: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                }}
            >
                <div className="flex-center" style={{ gap: '0.75rem', marginBottom: '3rem', justifyContent: 'flex-start' }}>
                    <div className="flex-center glass-pill" style={{ padding: '0.5rem', border: '1px solid var(--border-glow)' }}>
                        <Flame size={24} color="var(--primary)" />
                    </div>
                    <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Warkout</h2>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            style={{ textDecoration: 'none' }}
                        >
                            {({ isActive }) => (
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="glass-pill"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        justifyContent: 'flex-start',
                                        gap: '1rem',
                                        width: '100%',
                                        background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                                        borderColor: isActive ? 'var(--border-strong)' : 'transparent',
                                        boxShadow: isActive ? 'var(--glow-primary)' : 'none',
                                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    }}
                                >
                                    <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                                    <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                                </motion.div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div
                    className="user-profile"
                    style={{ position: 'relative', marginTop: 'auto', width: '100%' }}
                    onMouseEnter={() => setShowLogout(true)}
                    onMouseLeave={() => setShowLogout(false)}
                >
                    <div className="glass-pill" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-start', width: '100%', cursor: 'pointer' }}>
                        <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user === 'ishraq' ? 'IR' : 'G'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user === 'ishraq' ? 'Ishraq Rafi' : 'Portfolio Viewer'}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user === 'ishraq' ? 'Pro Member' : 'Guest Mode'}</p>
                        </div>
                    </div>

                    {/* Logout Popover */}
                    <AnimatePresence>
                        {showLogout && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                style={{ position: 'absolute', bottom: 'calc(100% + 0.5rem)', left: 0, right: 0, zIndex: 60 }}
                            >
                                <button
                                    onClick={handleLogout}
                                    className="glass-panel"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--danger)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Mobile Bottom Navigation Container */}
            <nav className="bottom-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} color={isActive ? 'var(--primary)' : 'currentColor'} />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
