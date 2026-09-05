/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Structured Generation Job Service
 * Persists and updates generation jobs in Firestore under users/{uid}/generationJobs/{jobId}
 */
import { serverDb } from '../usageManager.js';
import { ProviderName, JobType } from '../providers/AIProvider.js';

export interface GenerationJobRecord {
  jobId: string;
  uid: string;
  type: JobType;
  provider: ProviderName;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt: string;
  completedAt: string | null;
  errorCode: string | null;
  duration: number; // in milliseconds
  metadata: Record<string, any>;
}

export class JobService {
  /**
   * Create an initial generation job record
   */
  public static async createJob(params: {
    jobId: string;
    uid: string;
    type: JobType;
    provider: ProviderName;
    metadata?: Record<string, any>;
  }): Promise<GenerationJobRecord> {
    const nowIso = new Date().toISOString();
    
    // Sanitize metadata to remove any potential secret keys or huge payloads
    const safeMetadata = { ...(params.metadata || {}) };
    delete safeMetadata.apiKey;
    delete safeMetadata.token;
    delete safeMetadata.authorization;
    delete safeMetadata.audioBase64; // Don't bloat Firestore metadata with large raw audio

    const jobRecord: GenerationJobRecord = {
      jobId: params.jobId,
      uid: params.uid,
      type: params.type,
      provider: params.provider,
      status: 'processing',
      createdAt: nowIso,
      startedAt: nowIso,
      completedAt: null,
      errorCode: null,
      duration: 0,
      metadata: safeMetadata,
    };

    try {
      const jobRef = serverDb.collection('users').doc(params.uid).collection('generationJobs').doc(params.jobId);
      await jobRef.set(jobRecord);
    } catch (err) {
      console.warn(`[JOBS] Failed to persist initial job ${params.jobId} in Firestore:`, err);
    }

    return jobRecord;
  }

  /**
   * Mark a job as completed
   */
  public static async completeJob(params: {
    uid: string;
    jobId: string;
    startedAtMs: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const nowMs = Date.now();
    const duration = Math.max(0, nowMs - params.startedAtMs);
    const nowIso = new Date(nowMs).toISOString();

    const safeMetadata = { ...(params.metadata || {}) };
    delete safeMetadata.apiKey;
    delete safeMetadata.token;
    delete safeMetadata.audioBase64;

    try {
      const jobRef = serverDb.collection('users').doc(params.uid).collection('generationJobs').doc(params.jobId);
      await jobRef.update({
        status: 'completed',
        completedAt: nowIso,
        duration,
        errorCode: null,
        ...safeMetadata,
      });
    } catch (err) {
      console.warn(`[JOBS] Failed to mark job ${params.jobId} completed in Firestore:`, err);
    }
  }

  /**
   * Mark a job as failed and record error code
   */
  public static async failJob(params: {
    uid: string;
    jobId: string;
    startedAtMs: number;
    errorCode: string;
    errorMessage?: string;
  }): Promise<void> {
    const nowMs = Date.now();
    const duration = Math.max(0, nowMs - params.startedAtMs);
    const nowIso = new Date(nowMs).toISOString();

    try {
      const jobRef = serverDb.collection('users').doc(params.uid).collection('generationJobs').doc(params.jobId);
      await jobRef.update({
        status: 'failed',
        completedAt: nowIso,
        duration,
        errorCode: params.errorCode,
        errorMessage: params.errorMessage || 'Generation failed',
      });
    } catch (err) {
      console.warn(`[JOBS] Failed to mark job ${params.jobId} failed in Firestore:`, err);
    }
  }

  /**
   * Fetch recent jobs for a user
   */
  public static async getUserJobs(uid: string, maxLimit: number = 20): Promise<GenerationJobRecord[]> {
    try {
      const jobsCol = serverDb.collection('users').doc(uid).collection('generationJobs');
      const q = jobsCol.orderBy('createdAt', 'desc').limit(maxLimit);
      const snap = await q.get();

      return snap.docs.map(d => d.data() as GenerationJobRecord);
    } catch (err) {
      console.warn(`[JOBS] Error fetching jobs for ${uid}:`, err);
      return [];
    }
  }
}
