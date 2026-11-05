import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  track: 'frontend' | 'backend' | 'fullstack';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyCommitmentHours: number;
  xp: number;
  streakDays: number;
  completedTasks: string[];
  readinessScore?: number | null;
  onboardingComplete: boolean;
  careerGoal?: string;
  currentSkills: string[];
  dailyStudyHours?: number;
  dreamCompany?: string;
  codechefReminderEnabled: boolean;
  codechefReminderTime: string;
  lastCodechefReminderSentAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    track: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack'],
      default: 'fullstack',
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    weeklyCommitmentHours: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    completedTasks: [{ type: String }],
    readinessScore: { type: Number, default: null },
    onboardingComplete: { type: Boolean, default: false },
    careerGoal: { type: String, default: undefined },
    currentSkills: { type: [String], default: [] },
    dailyStudyHours: { type: Number, default: undefined },
    dreamCompany: { type: String, default: undefined },
    codechefReminderEnabled: { type: Boolean, default: false },
    codechefReminderTime: { type: String, default: '18:00' },
    lastCodechefReminderSentAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
