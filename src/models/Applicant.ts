import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicant extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string; // Link to uploaded PDF/Doc
  rawResumeText?: string; // Extracted text from resume for AI parsing
  parsedData?: any; // Structured profile details if coming from Umurava structured data
  appliedJobId: mongoose.Types.ObjectId;
  status: 'new' | 'screening' | 'shortlisted' | 'rejected';
  createdAt: Date;
}

const ApplicantSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  linkedInUrl: { type: String, required: false },
  portfolioUrl: { type: String, required: false },
  resumeUrl: { type: String, required: false }, // Useful when external board
  rawResumeText: { type: String, required: false },
  parsedData: { type: Schema.Types.Mixed, required: false }, // Flexible schema for structured profiles
  appliedJobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['new', 'screening', 'shortlisted', 'rejected'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IApplicant>('Applicant', ApplicantSchema);
