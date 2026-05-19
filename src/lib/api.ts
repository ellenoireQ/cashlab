/**
 * API Configuration and Client
 *
 * This file contains all API endpoint definitions and helper functions
 * for making requests to the backend API.
 */

// API Base URL - can be configured via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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

  // Dashboard endpoints
  dashboard: {
    saveAnalysis: `${API_BASE_URL}/api/dashboard/save-analysis`,
    getAnalysis: (teamId: string, type?: string) => {
      const query = type ? `?analysis_type=${type}` : ''
      return `${API_BASE_URL}/api/dashboard/analysis/${teamId}${query}`
    },
    deleteAnalysis: (analysisId: string) =>
      `${API_BASE_URL}/api/dashboard/analysis/${analysisId}`,
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

/**
 * Dashboard Analysis Types
 */
export interface AnalysisRecord {
  id: string
  team_id: string
  team_name: string
  analysis_type: string
  data: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SaveAnalysisRequest {
  analysis_type: string
  team_id: string
  team_name: string
  data: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface SaveAnalysisResponse {
  success: boolean
  message: string
  record?: AnalysisRecord
  error?: string
}

export interface GetAnalysisResponse {
  success: boolean
  records: AnalysisRecord[]
  count: number
}

/**
 * Dashboard Functions
 */

/**
 * Save analysis results to database
 * @param analysisType - Type of analysis (anomaly, overview, trend, etc.)
 * @param teamId - Team identifier
 * @param teamName - Team name
 * @param data - Analysis data to save
 * @param metadata - Optional metadata
 * @returns Promise with save response
 */
export async function saveAnalysisToDatabase(
  analysisType: string,
  teamId: string,
  teamName: string,
  data: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<SaveAnalysisResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.dashboard.saveAnalysis, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysis_type: analysisType,
        team_id: teamId,
        team_name: teamName,
        data,
        metadata,
      }),
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.detail || 'Failed to save analysis')
    }

    return response.json()
  } catch (err) {
    return {
      success: false,
      message: 'Failed to save analysis',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Retrieve analysis records for a team
 * @param teamId - Team identifier
 * @param analysisType - Optional: filter by analysis type
 * @returns Promise with analysis records
 */
export async function getTeamAnalysis(
  teamId: string,
  analysisType?: string
): Promise<GetAnalysisResponse> {
  try {
    const url = API_ENDPOINTS.dashboard.getAnalysis(teamId, analysisType)
    return await apiFetch(url)
  } catch (err) {
    return {
      success: false,
      records: [],
      count: 0,
    }
  }
}

/**
 * Delete an analysis record
 * @param analysisId - Analysis ID to delete
 * @returns Promise with deletion response
 */
export async function deleteAnalysisRecord(
  analysisId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      API_ENDPOINTS.dashboard.deleteAnalysis(analysisId),
      {
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.detail || 'Failed to delete analysis')
    }

    return response.json()
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to delete analysis',
    }
  }
}
