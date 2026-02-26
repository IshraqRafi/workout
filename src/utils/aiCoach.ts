import type { DailyWorkout, Exercise } from '../data/workoutPlan';
import { createSets } from '../data/workoutPlan';
import type { DetailedWorkoutLog } from '../contexts/WorkoutContext';

/**
 * The Algorithmic AI Coach Engine
 * Takes daily inputs and modifies the base calisthenics plan 
 * specifically tailored for hypertrophy and broad shoulders.
 */
export function generateDynamicWorkout(
    baseWorkout: DailyWorkout,
    sleepHours: number,
    sleepMinutes: number,
    dietText: string,
    readiness: number, // 0 to 100
    history: DetailedWorkoutLog[],
    userLevel: number
): DailyWorkout {
    // Clone the base workout to avoid mutating the original
    const customizedWorkout: DailyWorkout = JSON.parse(JSON.stringify(baseWorkout));

    // Calculate Sleep Score (0 to 100)
    const totalSleepHours = sleepHours + (sleepMinutes / 60);
    let sleepScore = (totalSleepHours / 8) * 100;
    if (sleepScore > 100) sleepScore = 100;
    if (sleepScore < 0) sleepScore = 0;

    // Calculate Nutrition Score (0 to 100) based on text keywords
    const text = dietText.toLowerCase();
    let nutritionScore = 50;

    // Positive keywords
    const goodWords = ['protein', 'chicken', 'beef', 'egg', 'meat', 'healthy', 'balanced', 'good', 'water', 'veg', 'fruit', 'fish', 'clean', 'rice'];
    goodWords.forEach(word => {
        if (text.includes(word)) nutritionScore += 10;
    });

    // Negative keywords
    const badWords = ['sugar', 'junk', 'fast food', 'pizza', 'burger', 'candy', 'soda', 'bad', 'sweet', 'fried', 'alcohol', 'beer'];
    badWords.forEach(word => {
        if (text.includes(word)) nutritionScore -= 15;
    });

    if (nutritionScore > 100) nutritionScore = 100;
    if (nutritionScore < 0) nutritionScore = 0;

    // Overall recovery
    const recoveryScore = (sleepScore + nutritionScore + readiness) / 3;
    const isRecoveryDay = customizedWorkout.type === "Recovery";

    // ==========================================
    // PHASE 1: INDIVIDUAL EXERCISE PROGRESSION
    // ==========================================
    customizedWorkout.exercises.forEach(ex => {
        // Find the last time the user performed THIS EXACT exercise
        const pastSessions = history.filter(log => log.exercises.some(e => e.name === ex.name));
        if (pastSessions.length > 0) {
            // Get the most recent log of this exercise
            const lastSession = pastSessions[pastSessions.length - 1];
            const historicEx = lastSession.exercises.find(e => e.name === ex.name);

            if (historicEx) {
                // Analyze Performance
                let successfulSets = 0;
                let failedSets = 0;
                let totalCompletedReps = 0;
                let heavyFatigueDrop = false;

                const repsLog: number[] = [];

                historicEx.sets.forEach((set, i) => {
                    const target = parseInt(String(set.targetReps).split('-')[1] || String(set.targetReps)); // e.g. "8-10" -> 10 or "10" -> 10
                    const completed = Number(set.completedReps || 0);
                    repsLog.push(completed);
                    totalCompletedReps += completed;

                    // If it's a number-based rep scheme (not 'max' or '30 sec')
                    if (!isNaN(target)) {
                        if (completed >= target) successfulSets++;
                        else failedSets++;

                        // Check for sharp fatigue drop-off (e.g., Set 1: 10, Set 2: 5)
                        if (i > 0 && repsLog[i - 1] - repsLog[i] >= 4) {
                            heavyFatigueDrop = true;
                        }
                    }
                });

                // Progressive Overload (If they crushed it last time)
                if (successfulSets > 0 && failedSets === 0) {
                    ex.sets.forEach(set => {
                        const targetStr = String(set.targetReps);
                        const match = targetStr.match(/(\d+)-(\d+)/);
                        if (match) {
                            // "8-10" becomes "9-11"
                            set.targetReps = `${Number(match[1]) + 1}-${Number(match[2]) + 1}`;
                        } else if (!isNaN(Number(set.targetReps))) {
                            // "10" becomes "11"
                            set.targetReps = `${Number(set.targetReps) + 1}`;
                        }
                    });
                    ex.notes = "Coach: You hit every set last week. I've increased the rep target. Push yourself!";
                }
                // Analyzation of Failure
                else if (failedSets > 0) {
                    // Coach adjusts the target to be more realistic to build confidence and form
                    ex.sets.forEach(set => {
                        const targetNum = parseInt(String(set.targetReps).split('-')[0] || String(set.targetReps));
                        if (!isNaN(targetNum) && targetNum > 5) {
                            set.targetReps = `${targetNum - 1}`; // lower the floor slightly
                        }
                    });

                    if (heavyFatigueDrop) {
                        if (ex.name.toLowerCase().includes("pull") || ex.name.toLowerCase().includes("row") || ex.name.toLowerCase().includes("chin")) {
                            ex.notes = "Coach: You had a massive rep drop-off last session. Looks like severe grip/forearm fatigue. Focus on holding tight, rest 90s between sets.";
                        } else {
                            ex.notes = "Coach: Your endurance failed sharply last time. Don't rush. Breathe and control the eccentric movement.";
                        }
                    } else {
                        ex.notes = "Coach: You struggled to hit target reps last session. I've adjusted the range. Focus strictly on perfect form.";
                    }
                }
            }
        }
    });

    // ==========================================
    // PHASE 2: DAILY READINESS & FATIGUE OVERRIDES
    // ==========================================
    if (userLevel > 0 && userLevel % 5 === 0 && !isRecoveryDay) {
        // BOSS FIGHT MILESTONE!
        customizedWorkout.isBossFight = true;
        customizedWorkout.title = `🔥 BOSS FIGHT: LEVEL ${userLevel} TRIAL`;
        customizedWorkout.type = "Milestone Challenge";
        customizedWorkout.aiNotes = `AI Coach Note: Congratulations on reaching Level ${userLevel}! Today is not a normal training day. Today is a BOSS FIGHT. I have wiped your scheduled workout and replaced it with a sheer test of will. Prove your progressive overload.`;

        customizedWorkout.exercises = [
            {
                id: "boss-1",
                name: "The Crucible: Max Pull-ups",
                sets: createSets(1, "Absolute Max"),
                notes: "Do not drop from the bar until your lats fail."
            },
            {
                id: "boss-2",
                name: "The Crucible: Max Push-ups",
                sets: createSets(1, "Absolute Max"),
                notes: "Chest to floor. Go until you cannot push up."
            },
            {
                id: "boss-3",
                name: "The Crucible: Max Pistol Squats (Per Leg)",
                sets: createSets(1, "Absolute Max"),
                notes: "Test your balance and quad strength."
            }
        ];
    }
    else if (recoveryScore < 45 && !isRecoveryDay) {
        customizedWorkout.exercises.forEach(ex => {
            if (ex.sets.length > 2) ex.sets.pop();
        });
        customizedWorkout.aiNotes = "AI Coach Note: Your recovery score is quite low today based on sleep, diet, and fatigue. I have automatically reduced the set volume by ~25% to prioritize recovery while still stimulating muscle growth. Do not push to absolute failure.";
    }
    else if (recoveryScore >= 85 && !isRecoveryDay) {
        const pushFinisher: Exercise = {
            id: `ai-finisher-push`,
            name: "🔥 AI Finisher: Pike-To-Plank Burnout",
            sets: createSets(2, "max reps"),
            notes: "Added by AI because your recovery is excellent. Maximize shoulder burn."
        };
        const pullFinisher: Exercise = {
            id: `ai-finisher-pull`,
            name: "🔥 AI Finisher: Max Dead Hang",
            sets: createSets(2, "until grip failing"),
            notes: "Added by AI to widen the lats and build forearm endurance."
        };

        if (customizedWorkout.title.includes("Push")) {
            customizedWorkout.exercises.push(pushFinisher);
        } else if (customizedWorkout.title.includes("Pull")) {
            customizedWorkout.exercises.push(pullFinisher);
        }

        customizedWorkout.aiNotes = "AI Coach Note: Your recovery score is outstanding! You are primed to perform. I've added a high-intensity finisher to push maximum muscle adaptation toward your broad-shoulder goals.";
    }
    else {
        customizedWorkout.aiNotes = "AI Coach Note: Your recovery is solid. Hit the prescribed workout hard with perfect calisthenics form. The specific reps have been tailored to your progressive overload capacity.";
    }

    return customizedWorkout;
}
