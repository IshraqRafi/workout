import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { workoutPlan } from '../data/workoutPlan';
import type { DailyWorkout, Exercise } from '../data/workoutPlan';

export type DetailedWorkoutLog = {
    date: string;
    dayIndex: number;
    exercises: Exercise[];
};

interface WorkoutContextType {
    getTodayWorkout: () => DailyWorkout;
    logWorkout: (workout: DetailedWorkoutLog) => void;
    history: DetailedWorkoutLog[];
    hasLoggedToday: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const [history, setHistory] = useState<DetailedWorkoutLog[]>([]);
    const { user } = useAuth();
    const isOwner = user === 'ishraq';

    useEffect(() => {
        const loadHistory = async () => {
            if (isOwner) {
                try {
                    const response = await fetch('/api/load');
                    if (response.ok) {
                        const data = await response.json();
                        setHistory(data.history || []);
                    } else {
                        throw new Error('Failed to fetch from KV');
                    }
                } catch (error) {
                    console.error("Vercel KV Error, falling back to local:", error);
                    // Fallback to local if backend fails (e.g. dev mode without env)
                    const saved = localStorage.getItem('workoutHistory');
                    if (saved) setHistory(JSON.parse(saved));
                }
            } else {
                // Guest mode: strictly local
                const saved = localStorage.getItem('workoutHistory');
                if (saved) setHistory(JSON.parse(saved));
            }
        };

        loadHistory();
    }, [isOwner]);

    const getTodayWorkout = () => {
        const today = new Date().getDay(); // 0-6 (Sun-Sat)
        // Deep clone to avoid mutating the base plan
        return JSON.parse(JSON.stringify(workoutPlan[today]));
    };

    const logWorkout = async (workout: DetailedWorkoutLog) => {
        const existingIndex = history.findIndex(h => h.date === workout.date);
        let newHistory;
        if (existingIndex >= 0) {
            newHistory = [...history];
            newHistory[existingIndex] = workout;
        } else {
            newHistory = [...history, workout];
        }
        setHistory(newHistory);
        localStorage.setItem('workoutHistory', JSON.stringify(newHistory)); // Always keep local mirror

        // Cloud sync for Owner
        if (isOwner) {
            try {
                await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: newHistory })
                });
            } catch (error) {
                console.error("Failed to sync to Vercel KV:", error);
            }
        }
    };

    const now = new Date();
    const yearStr = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const todayDateLocal = `${yearStr}-${monthStr}-${dayStr}`;

    const hasLoggedToday = history.some(log => log.date === todayDateLocal);

    return (
        <WorkoutContext.Provider value={{ getTodayWorkout, logWorkout, history, hasLoggedToday }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};
