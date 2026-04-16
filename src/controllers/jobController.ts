import { Request, Response } from 'express';
import Job from '../models/Job';
import Applicant from '../models/Applicant';
import ScreeningResult from '../models/ScreeningResult';
import { screenApplicantsForJob } from '../services/aiService';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Public (Simulating Recruiter Access)
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, department, requirements, skills, experienceLevel, minimumExperienceYears } = req.body;

    const job = new Job({
      title,
      description,
      department,
      requirements,
      skills,
      experienceLevel,
      minimumExperienceYears
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Public
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Cascading Deletion
    await Applicant.deleteMany({ appliedJobId: req.params.id });
    await ScreeningResult.deleteMany({ jobId: req.params.id });

    res.status(200).json({ message: 'Job removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Public
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Trigger AI Screening for Job
// @route   POST /api/jobs/:id/screen
// @access  Public
export const screenJobApplicants = async (req: Request, res: Response) => {
  try {
    const results = await screenApplicantsForJob(req.params.id as string);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
