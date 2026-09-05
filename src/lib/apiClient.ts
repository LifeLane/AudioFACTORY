/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Centralized API Client
* Routes all API requests through secure trusted backend with Firebase ID Token authentication.
*/
import { auth } from '../config/firebaseConfig';

export function getApiBaseUrl(): string {
  // If explicitly provided via VITE_API_BASE_URL (e.g. Cloud Run production URL)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }

  // Fallback to relative /api in both dev and prod
  return '/api';
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (err) {
      console.warn('[ApiClient] Failed to retrieve Firebase ID token:', err);
    }
  }

  return headers;
}

export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'API_ERROR', message: response.statusText }));
    throw new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T = any>(endpoint: string, body: any): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'API_ERROR', message: response.statusText }));
    const err: any = new Error(errorBody.message || errorBody.error || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.statusCode = response.status;
    err.code = errorBody.error;
    err.quotaDetails = errorBody.details;
    throw err;
  }

  return response.json();
}
