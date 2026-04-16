import { Request, Response } from 'express';
import Applicant from '../models/Applicant';
import Job from '../models/Job';
import ScreeningResult from '../models/ScreeningResult';

// @desc    Get all applicants for a specific job
// @route   GET /api/applicants/job/:jobId
// @access  Public
export const getApplicantsByJob = async (req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find({ appliedJobId: req.params.jobId }).sort({ createdAt: -1 });
    res.status(200).json(applicants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit new applicant (Structured or basic resume text)
// @route   POST /api/applicants
// @access  Public
export const createApplicant = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, appliedJobId, rawResumeText, parsedData } = req.body;

    // Verify job exists
    const job = await Job.findById(appliedJobId);
    if (!job) {
      return res.status(404).json({ message: 'Applied Job not found' });
    }

    const applicant = new Applicant({
      firstName,
      lastName,
      email,
      phone,
      appliedJobId,
      rawResumeText,
      parsedData
    });

    const createdApplicant = await applicant.save();
    res.status(201).json(createdApplicant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get screening results for a specific job
// @route   GET /api/applicants/job/:jobId/results
// @access  Public (or protected if preferred, keeping public for now to simplify frontend fetch)
export const getScreeningResultsByJob = async (req: Request, res: Response) => {
  try {
    const results = await ScreeningResult.find({ jobId: req.params.jobId })
      .populate('applicantId')
      .sort({ matchScore: -1 });
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Batch create applicants (Scenario 2: Bulk Upload)
// @route   POST /api/applicants/batch
// @access  Public
export const createApplicantsBatch = async (req: Request, res: Response) => {
  try {
    const { applicants, jobId } = req.body;

    if (!Array.isArray(applicants)) {
      return res.status(400).json({ message: 'Applicants must be an array' });
    }

    // Map through and prepare documents
    const applicantDocs = applicants.map(app => ({
      ...app,
      appliedJobId: jobId
    }));

    const createdApplicants = await Applicant.insertMany(applicantDocs);
    res.status(201).json(createdApplicants);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all applicants across all jobs
// @route   GET /api/applicants
// @access  Public
export const getAllApplicants = async (req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find().populate('appliedJobId').sort({ createdAt: -1 });
    res.status(200).json(applicants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a specific applicant
// @route   DELETE /api/applicants/:id
// @access  Public
export const deleteApplicant = async (req: Request, res: Response) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    // Also delete associated screening results
    await ScreeningResult.deleteMany({ applicantId: req.params.id });
    
    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
