import mongoose, { Schema, Document } from 'mongoose';

export interface IUserWorkspace extends Document {
  userId: string;
  progress: Record<string, any>;
  missions: Record<string, any>;
  fullMissions: Record<string, any>;
  roadmaps: any[];
  practiceAttempts: any[];
  codingSubmissions: any[];
  projects: any[];
  interviewAttempts: any[];
  dsa: Record<string, any>;
  customDsaProblems: any[];
}

const UserWorkspaceSchema = new Schema<IUserWorkspace>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    progress: { type: Schema.Types.Mixed, default: () => ({}) },
    missions: { type: Schema.Types.Mixed, default: () => ({}) },
    fullMissions: { type: Schema.Types.Mixed, default: () => ({}) },
    roadmaps: { type: Schema.Types.Mixed, default: () => [] },
    practiceAttempts: { type: Schema.Types.Mixed, default: () => [] },
    codingSubmissions: { type: Schema.Types.Mixed, default: () => [] },
    projects: { type: Schema.Types.Mixed, default: () => [] },
    interviewAttempts: { type: Schema.Types.Mixed, default: () => [] },
    dsa: { type: Schema.Types.Mixed, default: () => ({}) },
    customDsaProblems: { type: Schema.Types.Mixed, default: () => [] },
  },
  { timestamps: true, minimize: false }
);

export const UserWorkspace = mongoose.model<IUserWorkspace>('UserWorkspace', UserWorkspaceSchema);
