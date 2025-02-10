export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  totalSets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  date: string;
  duration: number;
}

export interface Measurements {
  id?: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  leftArm: number;
  rightArm: number;
  leftThigh: number;
  rightThigh: number;
  leftCalf: number;
  rightCalf: number;
}

export interface WeightLog {
  id?: string;
  date: string;
  weight: number;
}

export interface Set {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseInProgress extends Exercise {
  sets: Set[];
}
