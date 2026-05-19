import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeDataWithAI, generateAISummary, type AIInsight } from '@/lib/api'

interface AnalysisCache {
  summary: string | null
  generalInsights: AIInsight | null
  trends: AIInsight | null
  anomalies: AIInsight | null
}

interface AnalysisLoadingState {
  summary: boolean
  overview: boolean
  trends: boolean
  anomaly: boolean
}

interface UseAnalysisCacheReturn {
  cache: AnalysisCache
  loading: AnalysisLoadingState
  error: string | null
  regenerateSummary: () => Promise<void>
  regenerateOverview: () => Promise<void>
  regenerateTrends: () => Promise<void>
  regenerateAnomalies: () => Promise<void>
  regenerateAll: () => Promise<void>
  clearCache: () => void
}

/**
 * Hook to manage AI analysis results cache
 * Cache will be stored temporarily and can be regenerated on demand
 */
export function useAnalysisCache(
  data: Record<string, unknown>[],
  headers: string[]
): UseAnalysisCacheReturn {
  const [cache, setCache] = useState<AnalysisCache>({
    summary: null,
    generalInsights: null,
    trends: null,
    anomalies: null,
  })

  const [loading, setLoading] = useState<AnalysisLoadingState>({
    summary: false,
    overview: false,
    trends: false,
    anomaly: false,
  })

  const [error, setError] = useState<string | null>(null)

  // Generate hash from data to detect changes
  const dataHashRef = useRef<string>('')

  const generateDataHash = useCallback((data: Record<string, unknown>[], headers: string[]): string => {
    // Simple hash: combine number of rows and headers
    return `${data.length}|${headers.join(',')}|${data.length > 0 ? JSON.stringify(data[0]) : ''}`
  }, [])

  // Clear cache if data changes
  useEffect(() => {
    const newHash = generateDataHash(data, headers)
    if (dataHashRef.current && dataHashRef.current !== newHash) {
      // Data changed, clear cache
      setCache({
        summary: null,
        generalInsights: null,
        trends: null,
        anomalies: null,
      })
      setError(null)
    }
    dataHashRef.current = newHash
  }, [data, headers, generateDataHash])

  const regenerateSummary = useCallback(async () => {
    if (data.length === 0 || headers.length === 0) return

    setLoading((prev) => ({ ...prev, summary: true }))
    setError(null)

    try {
      const result = await generateAISummary(data, headers)
      if (result.success) {
        setCache((prev) => ({ ...prev, summary: result.summary }))
      } else {
        setError('Failed to generate summary')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to generate summary'
      setError(errorMsg)
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }))
    }
  }, [data, headers])

  const regenerateOverview = useCallback(async () => {
    if (data.length === 0 || headers.length === 0) return

    setLoading((prev) => ({ ...prev, overview: true }))
    setError(null)

    try {
      const result = await analyzeDataWithAI(data, headers, 'general')
      if (result.success) {
        setCache((prev) => ({
          ...prev,
          generalInsights: result.insights,
        }))
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to analyze data'
      setError(errorMsg)
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }))
    }
  }, [data, headers])

  const regenerateTrends = useCallback(async () => {
    if (data.length === 0 || headers.length === 0) return

    setLoading((prev) => ({ ...prev, trends: true }))
    setError(null)

    try {
      const result = await analyzeDataWithAI(data, headers, 'trend')
      if (result.success) {
        setCache((prev) => ({
          ...prev,
          trends: result.insights,
        }))
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to analyze data'
      setError(errorMsg)
    } finally {
      setLoading((prev) => ({ ...prev, trends: false }))
    }
  }, [data, headers])

  const regenerateAnomalies = useCallback(async () => {
    if (data.length === 0 || headers.length === 0) return

    setLoading((prev) => ({ ...prev, anomaly: true }))
    setError(null)

    try {
      const result = await analyzeDataWithAI(data, headers, 'anomaly')
      if (result.success) {
        setCache((prev) => ({
          ...prev,
          anomalies: result.insights,
        }))
      } else {
        setError(result.error || 'Anomaly detection failed')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to detect anomalies'
      setError(errorMsg)
    } finally {
      setLoading((prev) => ({ ...prev, anomaly: false }))
    }
  }, [data, headers])

  const regenerateAll = useCallback(async () => {
    if (data.length === 0 || headers.length === 0) return

    // Run all 4 analyses in parallel
    await Promise.all([
      regenerateSummary(),
      regenerateOverview(),
      regenerateTrends(),
      regenerateAnomalies(),
    ])
  }, [data, headers, regenerateSummary, regenerateOverview, regenerateTrends, regenerateAnomalies])

  const clearCache = useCallback(() => {
    setCache({
      summary: null,
      generalInsights: null,
      trends: null,
      anomalies: null,
    })
    setError(null)
  }, [])

  // NOTE: Auto-generation disabled - analysis is now manual only
  // Users must explicitly click "Scan" or "Analyze" button to trigger analysis

  return {
    cache,
    loading,
    error,
    regenerateSummary,
    regenerateOverview,
    regenerateTrends,
    regenerateAnomalies,
    regenerateAll,
    clearCache,
  }
}
