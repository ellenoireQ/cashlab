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
  
  // AI endpoints
  ai: {
    analyze: `${API_BASE_URL}/api/ai/analyze`,
    summary: `${API_BASE_URL}/api/ai/summary`,
    health: `${API_BASE_URL}/api/ai/health`,
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
 * AI Insights Types
 */
export interface AIInsight {
  key_insights?: string[]
  data_quality?: string
  recommendations?: string[]
  anomalies?: Array<{
    column: string
    description: string
    severity: 'low' | 'medium' | 'high'
    affected_rows: string
  }>
  trends?: Array<{
    type: 'increasing' | 'decreasing' | 'stable' | 'seasonal'
    column: string
    description: string
    confidence: 'low' | 'medium' | 'high'
  }>
  correlations?: string[]
  predictions?: string[]
  raw_response?: string
  parsed?: boolean
}

export interface AIAnalyzeResponse {
  success: boolean
  insights: AIInsight
  analysis_type: string
  error?: string
}

export interface AISummaryResponse {
  success: boolean
  summary: string
}

export interface AIHealthResponse {
  configured: boolean
  service: string
  status: string
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


/**
 * AI Insights Functions
 */

/**
 * Analyze data with AI
 * @param data - Array of data rows
 * @param headers - Column headers
 * @param analysisType - Type of analysis (general, anomaly, trend)
 * @returns Promise with AI insights
 */
export async function analyzeDataWithAI(
  data: Record<string, unknown>[],
  headers: string[],
  analysisType: 'general' | 'anomaly' | 'trend' = 'general'
): Promise<AIAnalyzeResponse> {
  const response = await fetch(API_ENDPOINTS.ai.analyze, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
      headers,
      analysis_type: analysisType,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Failed to analyze data')
  }

  return response.json()
}

/**
 * Generate data summary with AI
 * @param data - Array of data rows
 * @param headers - Column headers
 * @returns Promise with summary text
 */
export async function generateAISummary(
  data: Record<string, unknown>[],
  headers: string[]
): Promise<AISummaryResponse> {
  const response = await fetch(API_ENDPOINTS.ai.summary, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data,
      headers,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || 'Failed to generate summary')
  }

  return response.json()
}

/**
 * Check AI service health
 * @returns Promise with health status
 */
export async function checkAIHealth(): Promise<AIHealthResponse> {
  return apiFetch(API_ENDPOINTS.ai.health)
}
