export interface ExerciseSet {
    id: string;
    targetReps: number | string; // e.g., 10, or "max", or "30 sec"
    completedReps?: number | string;
    isCompleted: boolean;
}

export interface Exercise {
    id: string;
    name: string;
    sets: ExerciseSet[];
    notes?: string;
}

export interface DailyWorkout {
    dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    title: string;
    type: string;
    exercises: Exercise[];
    progressionTip: string;
    aiNotes?: string; // Used by the AI Coach to explain adjustments
    isBossFight?: boolean;
}

// Helper to generate sets
export const createSets = (count: number, reps: number | string): ExerciseSet[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `set-${i}`,
        targetReps: reps,
        isCompleted: false,
    }));
};

export const workoutPlan: Record<number, DailyWorkout> = {
    // Day 3 (Sun) - Legs & Core Hypertrophy
    0: {
        dayIndex: 0,
        title: "Leg Hypertrophy & Core",
        type: "Strength",
        progressionTip: "As a taller guy, deep ranges of motion are harder but critical for leg growth. Go slow.",
        exercises: [
            { id: "e1", name: "Bulgarian Split Squats", sets: createSets(4, "8-10"), notes: "Use a chair. Deep stretch." },
            { id: "e2", name: "Assisted Pistol Squats", sets: createSets(3, "5-6"), notes: "Hold a doorframe for balance." },
            { id: "e3", name: "Glute Bridge Walkouts", sets: createSets(3, 10) },
            { id: "e4", name: "Single-Leg Calf Raises", sets: createSets(4, "15-20"), notes: "Pause at the bottom stretch." },
            { id: "e5", name: "L-Sit Tucks", sets: createSets(3, "15-20 sec") },
            { id: "e6", name: "Hollow Body Hold", sets: createSets(3, "45 sec") },
        ]
    },
    // Day 4 (Mon) - Active Recovery
    1: {
        dayIndex: 1,
        title: "Active Recovery & Mobility",
        type: "Recovery",
        progressionTip: "Don't skip mobility. Taller frames need more shoulder/hip opening.",
        exercises: [
            { id: "e1", name: "Light Jog / Walk", sets: createSets(1, "20 min") },
            { id: "e2", name: "Shoulder Dislocates", sets: createSets(3, 15), notes: "Use a towel or broomstick." },
            { id: "e3", name: "Deep Squat Hold", sets: createSets(3, "60 sec") },
            { id: "e4", name: "Dead Hang", sets: createSets(3, "30 sec"), notes: "Decompress the spine." },
        ]
    },
    // Day 5 (Tue) - Heavy Push (Chest & Shoulders Focus)
    2: {
        dayIndex: 2,
        title: "Heavy Push (Broad Shoulders Focus)",
        type: "Strength - Hypertrophy",
        progressionTip: "Focus intensely on Pike Push-ups to build those boulder shoulders.",
        exercises: [
            { id: "e1", name: "Pike Push-ups", sets: createSets(4, "6-8"), notes: "Lean far forward, touch nose to floor." },
            { id: "e2", name: "Deficit Push-ups", sets: createSets(4, "8-12"), notes: "Use books under hands for deep chest stretch." },
            { id: "e3", name: "Chair Dips", sets: createSets(3, "10-15"), notes: "Keep elbows tucked in." },
            { id: "e4", name: "Wall Handstand Hold", sets: createSets(3, "30-45 sec"), notes: "Stomach to wall if possible." },
            { id: "e5", name: "Plank to Push-up", sets: createSets(3, 10) },
        ]
    },
    // Day 6 (Wed) - Heavy Pull (Back Width Focus)
    3: {
        dayIndex: 3,
        title: "Heavy Pull (V-Taper Focus)",
        type: "Strength - Hypertrophy",
        progressionTip: "A wide back gives the illusion of broader shoulders. Pull with your elbows.",
        exercises: [
            { id: "e1", name: "Wide-Grip Pull-ups", sets: createSets(4, "6-8"), notes: "Focus on lat stretch." },
            { id: "e2", name: "Chin-ups", sets: createSets(3, "8-10"), notes: "Biceps and lower lats." },
            { id: "e3", name: "Incline Body Rows", sets: createSets(4, "10-12"), notes: "Under a sturdy table or using bedsheets." },
            { id: "e4", name: "Reverse Snow Angels", sets: createSets(3, 15), notes: "Lie face down, squeeze upper back." },
            { id: "e5", name: "Dead Bug", sets: createSets(3, 12) },
        ]
    },
    // Day 7 (Thu) - Legs & Core Volume
    4: {
        dayIndex: 4,
        title: "Legs & Core Volume",
        type: "Endurance / Hypertrophy",
        progressionTip: "High volume today to pump blood into the muscles.",
        exercises: [
            { id: "e1", name: "Jumping Lunges", sets: createSets(4, 16), notes: "8 per leg." },
            { id: "e2", name: "Bodyweight Squats", sets: createSets(3, 25), notes: "Constant tension, no locking out." },
            { id: "e3", name: "Nordic Curls (Negatives)", sets: createSets(3, 5), notes: "Hook feet under couch. Control descent." },
            { id: "e4", name: "Calf Raises", sets: createSets(4, 25) },
            { id: "e5", name: "V-Ups", sets: createSets(3, 15) },
            { id: "e6", name: "Russian Twists", sets: createSets(3, 20) },
        ]
    },
    // Day 1 (Fri) - Volume Push (Chest & Triceps)
    5: {
        dayIndex: 5,
        title: "Volume Push (Chest & Triceps)",
        type: "Hypertrophy",
        progressionTip: "Chase the pump. Rest times strict at 60 seconds.",
        exercises: [
            { id: "e1", name: "Archer Push-ups", sets: createSets(3, "8-10"), notes: "4-5 per arm." },
            { id: "e2", name: "Normal Push-ups", sets: createSets(4, "12-15") },
            { id: "e3", name: "Diamond Push-ups", sets: createSets(3, "8-12"), notes: "Total tricep isolation." },
            { id: "e4", name: "Elevated Pike Push-ups", sets: createSets(3, "8-10"), notes: "Feet on chair." },
            { id: "e5", name: "L-Sit Progressions", sets: createSets(3, "15 sec") },
        ]
    },
    // Day 2 (Sat) - Volume Pull (Back & Biceps)
    6: {
        dayIndex: 6,
        title: "Volume Pull (Back & Biceps)",
        type: "Hypertrophy",
        progressionTip: "Ectomorphs need intense back volume to look thicker from the side.",
        exercises: [
            { id: "e1", name: "Pull-ups", sets: createSets(4, "max reps") },
            { id: "e2", name: "Commando Pull-ups", sets: createSets(3, 6), notes: "Alternate grips." },
            { id: "e3", name: "Towel Bicep Curls", sets: createSets(3, 15), notes: "Isometrics using a towel under foot." },
            { id: "e4", name: "Bodyweight Face Pulls", sets: createSets(3, 12), notes: "Using table edge/sheets for rear delts." },
            { id: "e5", name: "Plank", sets: createSets(3, "60 sec") },
        ]
    }
};
