import express from 'express';
import { getJobs, getJobById, createJob, deleteJob, screenJobApplicants, updateJob } from '../controllers/jobController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.post('/:id/screen', protect, screenJobApplicants);

export default router;
