/**
 * API Configuration and Client
 * 
 * This file contains all API endpoint definitions and helper functions
 * for making requests to the backend API.
 */

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * API Endpoints Registry
 * All backend endpoints should be registered here for easy maintenance
 */
export const API_ENDPOINTS = {
  // Convert endpoints
  convert: {
    csvToArray: (useHeaders: boolean = true) => 
      `${API_BASE_URL}/api/convert/csv-to-array?use_headers=${useHeaders}`,
  },
  
  // Root endpoints
  root: `${API_BASE_URL}/`,
  hello: `${API_BASE_URL}/api/hello`,
} as const

/**
 * API Response Types
 */
export interface CsvToArrayResponse {
  data: Record<string, unknown>[]
}

export interface ApiError {
  detail: string
}

/**
 * API Client Helper Functions
 */

/**
 * Upload CSV file and convert to array
 * @param file - The CSV file to upload
 * @param useHeaders - Whether to use first row as headers (default: true)
 * @returns Promise with parsed CSV data
 */
export async function uploadCsvFile(
  file: File,
  useHeaders: boolean = true
): Promise<CsvToArrayResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(API_ENDPOINTS.convert.csvToArray(useHeaders), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Failed to upload CSV file')
  }

  return response.json()
}

/**
 * Generic fetch wrapper with error handling
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with response data
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unknown error occurred',
    }))
    throw new Error(error.detail)
  }

  return response.json()
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<{ message: string }> {
  return apiFetch(API_ENDPOINTS.hello)
}
