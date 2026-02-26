import type { DetailedWorkoutLog } from '../contexts/WorkoutContext';

export const EXP_PER_SET = 15;
export const EXP_BONUS_STREAK = 50;
export const BASE_LEVEL_EXP = 500;

export function calculateAthleteState(history: DetailedWorkoutLog[]) {
    let totalExp = 0;

    // Sort history oldest to newest for accurate streak
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let lastDate: Date | null = null;

    sortedHistory.forEach(log => {
        const logDate = new Date(log.date);

        // Calculate Streak
        if (lastDate) {
            const diffDays = Math.floor((logDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else if (diffDays > 1) {
                currentStreak = 1; // Reset streak if missed a day
            }
        } else {
            currentStreak = 1;
        }
        lastDate = logDate;

        // Calculate Sets
        const setsDone = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);

        // Add EXP
        totalExp += setsDone * EXP_PER_SET;
        if (currentStreak > 1) {
            totalExp += EXP_BONUS_STREAK;
        }
    });

    // Check if the current streak is still active today or yesterday
    if (lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lDate = new Date(lastDate);
        lDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 1) {
            currentStreak = 0;
        }
    }

    const level = Math.floor(totalExp / BASE_LEVEL_EXP) + 1;
    const currentLevelExp = totalExp % BASE_LEVEL_EXP;

    return {
        level,
        totalExp,
        currentLevelExp,
        expToNext: BASE_LEVEL_EXP,
        title: getTitleForLevel(level),
        currentStreak
    };
}

function getTitleForLevel(level: number) {
    if (level < 3) return "Novice";
    if (level < 6) return "Amateur";
    if (level < 10) return "Athlete";
    if (level < 15) return "Elite";
    if (level < 25) return "Master";
    return "Titan";
}

export function calculateReadiness(history: DetailedWorkoutLog[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let fatigue = 0;

    history.forEach(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 2) { // 48 hours impact
            const setsDone = log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
            const fatigueMultiplier = diffDays === 0 ? 3 : (diffDays === 1 ? 1.5 : 0.5);
            fatigue += setsDone * fatigueMultiplier;
        }
    });

    // 100% readiness minus fatigue points (cap at 10% minimum readiness)
    let readiness = 100 - fatigue;
    if (readiness < 10) readiness = 10;

    let status = "Prime to perform";
    let color = "var(--primary)";

    if (readiness < 40) {
        status = "Prioritize recovery";
        color = "var(--danger)";
    } else if (readiness < 70) {
        status = "Moderate fatigue";
        color = "var(--secondary)";
    }

    return { score: Math.round(readiness), status, color };
}
