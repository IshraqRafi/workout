import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: string | null;
    login: (username: string, password?: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Synchronous check to avoid unauthenticated flash on reload
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [user, setUser] = useState<string | null>(() => {
        return localStorage.getItem('authUser');
    });

    useEffect(() => {
        // Keep in sync with storage changes
        const handleStorageChange = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
            setUser(localStorage.getItem('authUser'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (username: string, password?: string) => {
        // Simulate API delay for a premium feel
        await new Promise(resolve => setTimeout(resolve, 800));

        if (username === 'ishraq' && password === 'ishraq') {
            setIsAuthenticated(true);
            setUser('ishraq');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authUser', 'ishraq');
            return true;
        } else if (username === 'guest') {
            setIsAuthenticated(true);
            setUser('guest');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authUser', 'guest');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
