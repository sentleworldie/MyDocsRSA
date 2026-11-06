import { apiRequest } from '@/lib/api';
import type { CertificationRequest, Credential } from '@/lib/types';

export type OfficerQueue = {
  pending: CertificationRequest[]; // waiting for an officer to start
  inReview: CertificationRequest[]; // started, not finished
};

/** Loads both lists the officer works from. */
export async function fetchOfficerQueue(): Promise<OfficerQueue> {
  const [pending, inReview] = await Promise.all([
    apiRequest<CertificationRequest[]>('/api/certification/requests/pending'),
    apiRequest<CertificationRequest[]>('/api/certification/requests/in-review'),
  ]);
  return { pending, inReview };
}

export function startReview(requestId: number) {
  return apiRequest<CertificationRequest>(`/api/certification/requests/${requestId}/review`, {
    method: 'PUT',
  });
}

export type StampPosition = 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'CENTER';

export function approveRequest(requestId: number, stampPosition: StampPosition) {
  return apiRequest<{ message: string; request: CertificationRequest; credential: Credential }>(
    `/api/certification/requests/${requestId}/approve`,
    { method: 'PUT', body: { stampPosition } },
  );
}

export function rejectRequest(requestId: number, reason: string) {
  return apiRequest<CertificationRequest>(`/api/certification/requests/${requestId}/reject`, {
    method: 'PUT',
    body: { reason },
  });
}

export function requestResubmission(requestId: number, reason: string) {
  return apiRequest<CertificationRequest>(
    `/api/certification/requests/${requestId}/more-information`,
    { method: 'PUT', body: { reason } },
  );
}
