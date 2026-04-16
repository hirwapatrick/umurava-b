import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  department?: string;
  requirements: string[]; // List of mandatory requirements
  skills: string[]; // Preferred/required skills
  experienceLevel: string; // e.g., 'Junior', 'Mid', 'Senior'
  minimumExperienceYears?: number;
  status: 'open' | 'closed';
  createdAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: false },
  requirements: { type: [String], required: true, default: [] },
  skills: { type: [String], required: true, default: [] },
  experienceLevel: { type: String, required: true },
  minimumExperienceYears: { type: Number, required: false, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJob>('Job', JobSchema);
