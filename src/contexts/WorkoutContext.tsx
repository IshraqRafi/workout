import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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

    useEffect(() => {
        const saved = localStorage.getItem('workoutHistory');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);

    const getTodayWorkout = () => {
        const today = new Date().getDay(); // 0-6 (Sun-Sat)
        // Deep clone to avoid mutating the base plan
        return JSON.parse(JSON.stringify(workoutPlan[today]));
    };

    const logWorkout = (workout: DetailedWorkoutLog) => {
        const existingIndex = history.findIndex(h => h.date === workout.date);
        let newHistory;
        if (existingIndex >= 0) {
            newHistory = [...history];
            newHistory[existingIndex] = workout;
        } else {
            newHistory = [...history, workout];
        }
        setHistory(newHistory);
        localStorage.setItem('workoutHistory', JSON.stringify(newHistory));
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
