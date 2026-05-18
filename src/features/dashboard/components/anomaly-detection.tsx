import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { analyzeDataWithAI, type AIInsight } from '@/lib/api'

interface AnomalyDetectionProps {
  data: Record<string, unknown>[]
  headers: string[]
}

export function AnomalyDetection({ data, headers }: AnomalyDetectionProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [anomalies, setAnomalies] = React.useState<AIInsight | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const hasData = data.length > 0 && headers.length > 0
  const anomalyList = anomalies?.anomalies || []
  const totalAnomalies = anomalyList.length
  const hasAnomalies = totalAnomalies > 0

  async function handleDetectAnomalies() {
    if (!hasData) return

    setLoading(true)
    setError(null)
    setCurrentIndex(0)

    try {
      const result = await analyzeDataWithAI(data, headers, 'anomaly')

      if (result.success) {
        setAnomalies(result.insights)
      } else {
        setError(result.error || 'Detection failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect anomalies')
    } finally {
      setLoading(false)
    }
  }

  function handlePrevious() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalAnomalies - 1))
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev < totalAnomalies - 1 ? prev + 1 : 0))
  }

  // Auto-detect when data changes
  React.useEffect(() => {
    if (hasData && !anomalies && !loading) {
      handleDetectAnomalies()
    }
  }, [data, headers])

  // Reset index when anomalies change
  React.useEffect(() => {
    if (currentIndex >= totalAnomalies && totalAnomalies > 0) {
      setCurrentIndex(0)
    }
  }, [totalAnomalies])

  if (!hasData) {
    return (
      <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
        <p className='text-sm text-muted-foreground'>
          No data to analyze
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='space-y-3'>
        <Skeleton className='h-24 w-full' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-8 w-16' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
        <p className='text-sm text-destructive'>{error}</p>
        <Button
          variant='outline'
          size='sm'
          className='mt-2'
          onClick={handleDetectAnomalies}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!hasAnomalies) {
    return (
      <div className='space-y-3'>
        <div className='flex min-h-[160px] items-center justify-center rounded-lg bg-muted/30'>
          <div className='text-center'>
            <div className='text-2xl font-bold'>0</div>
            <p className='mt-1 text-sm text-muted-foreground'>
              No issues detected
            </p>
          </div>
        </div>
        <div className='flex justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDetectAnomalies}
            disabled={loading}
          >
            Re-scan
          </Button>
        </div>
      </div>
    )
  }

  const currentAnomaly = anomalyList[currentIndex]

  return (
    <div className='space-y-3'>
      {/* Anomaly Display */}
      <div className='rounded-lg bg-muted/30 p-4'>
        <div className='mb-3 flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <div className='mb-1 text-sm font-medium'>
              {currentAnomaly.column}
            </div>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {currentAnomaly.description}
            </p>
          </div>
          <Badge
            variant={
              currentAnomaly.severity === 'high'
                ? 'destructive'
                : currentAnomaly.severity === 'medium'
                  ? 'default'
                  : 'secondary'
            }
            className='shrink-0'
          >
            {currentAnomaly.severity}
          </Badge>
        </div>
        {currentAnomaly.affected_rows && (
          <div className='text-xs text-muted-foreground'>
            {currentAnomaly.affected_rows}
          </div>
        )}
      </div>

      {/* Navigation */}
      {totalAnomalies > 1 && (
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            size='sm'
            onClick={handlePrevious}
          >
            Previous
          </Button>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {currentIndex + 1} / {totalAnomalies}
            </span>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Re-scan */}
      <div className='flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleDetectAnomalies}
          disabled={loading}
        >
          Re-scan
        </Button>
      </div>
    </div>
  )
}
