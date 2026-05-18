import * as React from 'react'
import { AlertTriangle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

  // Keyboard navigation
  React.useEffect(() => {
    if (!hasAnomalies) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasAnomalies, currentIndex, totalAnomalies])

  if (!hasData) {
    return (
      <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
        <div className='text-center'>
          <AlertTriangle className='mx-auto h-8 w-8 text-muted-foreground/50' />
          <p className='mt-2 text-sm text-muted-foreground'>
            No data to analyze
          </p>
          <p className='text-xs text-muted-foreground'>
            Import CSV to detect anomalies
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-32 w-full' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-8 w-8' />
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
      <div className='space-y-4'>
        <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
          <div className='text-center'>
            <Sparkles className='mx-auto h-8 w-8 text-green-600' />
            <p className='mt-2 text-sm font-medium'>No anomalies detected</p>
            <p className='text-xs text-muted-foreground'>
              Your data looks clean!
            </p>
          </div>
        </div>
        <div className='flex justify-center'>
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
    <div className='space-y-4'>
      {/* Anomaly Card */}
      <Card className='border-l-4 border-l-orange-500'>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex items-start gap-2'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-orange-600' />
              <div className='flex-1'>
                <CardTitle className='text-sm font-medium'>
                  {currentAnomaly.column}
                </CardTitle>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {currentAnomaly.description}
                </p>
              </div>
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
        </CardHeader>
        {currentAnomaly.affected_rows && (
          <CardContent className='pb-3 pt-0'>
            <p className='text-xs text-muted-foreground'>
              Affected: {currentAnomaly.affected_rows}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Navigation Controls */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          size='icon'
          onClick={handlePrevious}
          disabled={totalAnomalies <= 1}
          className='h-8 w-8'
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='sr-only'>Previous anomaly</span>
        </Button>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {currentIndex + 1} of {totalAnomalies}
          </span>
          <div className='flex gap-1'>
            {anomalyList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-4 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to anomaly ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Button
          variant='outline'
          size='icon'
          onClick={handleNext}
          disabled={totalAnomalies <= 1}
          className='h-8 w-8'
        >
          <ChevronRight className='h-4 w-4' />
          <span className='sr-only'>Next anomaly</span>
        </Button>
      </div>

      {/* Re-scan Button */}
      <div className='flex justify-center pt-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleDetectAnomalies}
          disabled={loading}
        >
          Re-scan for Anomalies
        </Button>
      </div>
    </div>
  )
}
