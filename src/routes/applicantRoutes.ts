import express from 'express';
import { getApplicantsByJob, createApplicant, getScreeningResultsByJob, createApplicantsBatch, getAllApplicants, deleteApplicant } from '../controllers/applicantController';

const router = express.Router();

router.route('/')
  .get(getAllApplicants)
  .post(createApplicant);

router.route('/batch')
  .post(createApplicantsBatch);

router.route('/:id')
  .delete(deleteApplicant);

router.route('/job/:jobId')
  .get(getApplicantsByJob);

router.route('/job/:jobId/results')
  .get(getScreeningResultsByJob);

export default router;
