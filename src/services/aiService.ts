import { GoogleGenAI } from '@google/genai';
import Job, { IJob } from '../models/Job';
import Applicant, { IApplicant } from '../models/Applicant';
import ScreeningResult from '../models/ScreeningResult';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithRetry(prompt: string, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      return response;
    } catch (error: any) {
      lastError = error;
      const statusCode = error?.status;
      
      // If 503 (Overloaded) or 429 (Rate Limit), retry with backoff
      if (statusCode === 503 || statusCode === 429) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`Gemini API Busy (${statusCode}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
          await sleep(delay);
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

export const screenApplicantsForJob = async (jobId: string) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');

    const applicants = await Applicant.find({ appliedJobId: jobId, status: 'new' });
    if (applicants.length === 0) return { message: 'No new applicants to screen.' };

    const jobContext = `
      Title: ${job.title}
      Experience Level: ${job.experienceLevel}
      Requirements: ${job.requirements.join(', ')}
      Skills: ${job.skills.join(', ')}
    `;

    const results = [];

    // Screen each applicant using Gemini
    for (const applicant of applicants) {
      const applicantContext = `
        Name: ${applicant.firstName} ${applicant.lastName}
        Parsed Data: ${JSON.stringify(applicant.parsedData || {})}
        Raw Text: ${applicant.rawResumeText || ''}
      `;

      const prompt = `
        You are an expert technical recruiter and AI talent screener.
        Evaluate the following applicant against the job description.
        
        Job Info:
        ${jobContext}
        
        Applicant Info:
        ${applicantContext}
        
        Please provide a strict JSON response evaluating the match.
        The JSON MUST have the following structure exactly:
        {
          "matchScore": <number between 0 and 100>,
          "strengths": [<array of key strings>],
          "gaps": [<array of key strings>],
          "recommendation": "<exactly one of: 'Strong Hire', 'Hire', 'Consider', 'Reject'>",
          "explanationDetails": "<detailed natural language explanation of the reasoning>"
        }
      `;

      // Small delay between applicants to avoid burst rate limits
      if (applicants.indexOf(applicant) > 0) {
        await sleep(500);
      }

      const response = await generateContentWithRetry(prompt);

      if (response.text !== undefined) {
         try {
             // Parse Gemini response
             const aiEval = JSON.parse(response.text);
             
             // Save Screening Result
             const result = new ScreeningResult({
               applicantId: applicant._id,
               jobId: job._id,
               matchScore: aiEval.matchScore || 0,
               strengths: aiEval.strengths || [],
               gaps: aiEval.gaps || [],
               recommendation: aiEval.recommendation || 'Consider',
               explanationDetails: aiEval.explanationDetails || 'No explanation provided.'
             });
             
             await result.save();
             
             // Update applicant status
             applicant.status = 'screening';
             await applicant.save();
             
             results.push(result);
             
         } catch (parseError) {
             console.error('Failed to parse Gemini response for applicant:', applicant._id, parseError);
         }
      }
    }

    return results;

  } catch (error) {
    console.error('AI Screening Error:', error);
    throw error;
  }
};
