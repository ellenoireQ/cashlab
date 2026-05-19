import * as React from 'react'
import { saveAnalysisToDatabase } from '@/lib/api'
import { useAnalysisCache } from '@/hooks/use-analysis-cache'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AnomalyDetectionProps {
  data: Record<string, unknown>[]
  headers: string[]
}

export function AnomalyDetection({ data, headers }: AnomalyDetectionProps) {
  const { cache, loading, error, regenerateAnomalies } = useAnalysisCache(
    data,
    headers
  )
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isSaved, setIsSaved] = React.useState(false)

  const hasData = data.length > 0 && headers.length > 0
  const anomalies = cache.anomalies
  const anomalyList = anomalies?.anomalies || []
  const totalAnomalies = anomalyList.length
  const hasAnomalies = totalAnomalies > 0

  function handleDetectAnomalies() {
    if (!hasData) return
    setCurrentIndex(0)
    regenerateAnomalies()
  }

  function handlePrevious() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalAnomalies - 1))
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev < totalAnomalies - 1 ? prev + 1 : 0))
  }

  async function handleSaveAnomalies() {
    if (!anomalies) return

    const saveData = {
      timestamp: new Date().toISOString(),
      totalAnomalies,
      anomalies: anomalyList,
    }

    // Dummy team data (for now)
    const dummyTeamId = `team-${Math.random().toString(36).substring(7)}`
    const dummyTeamName = 'Team Dummy'

    // Save to localStorage
    localStorage.setItem('detected-anomalies', JSON.stringify(saveData))

    // Save to database
    try {
      const response = await saveAnalysisToDatabase(
        'anomaly',
        dummyTeamId,
        dummyTeamName,
        saveData,
        { source: 'anomaly-detection', dataRows: data.length }
      )

      if (response.success) {
        console.log('✓ Analysis saved to database:', response.record?.id)
      } else {
        console.error('Failed to save to database:', response.error)
      }
    } catch (err) {
      console.error('Error saving analysis:', err)
    }

    // Download as JSON file
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(saveData, null, 2)
      )}`
    )
    element.setAttribute('download', `anomalies-${Date.now()}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setIsSaved(true)
    // Reset saved status after 2 seconds
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Reset index when anomalies change
  React.useEffect(() => {
    if (currentIndex >= totalAnomalies && totalAnomalies > 0) {
      setCurrentIndex(0)
    }
  }, [totalAnomalies])

  if (!hasData) {
    return (
      <div className='flex min-h-50 items-center justify-center rounded-lg border border-dashed'>
        <p className='text-sm text-muted-foreground'>No data to analyze</p>
      </div>
    )
  }

  if (loading.anomaly) {
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
        {error && (
          <Button
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={handleDetectAnomalies}
          >
            Retry
          </Button>
        )}
      </div>
    )
  }

  // No results yet - initial state, user needs to trigger scan
  if (!anomalies) {
    return (
      <div className='space-y-3'>
        <div className='flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed'>
          <div className='text-center'>
            <p className='mb-4 text-sm text-muted-foreground'>
              Ready to scan for anomalies?
            </p>
            <Button
              onClick={handleDetectAnomalies}
              disabled={loading.anomaly}
              size='lg'
            >
              {loading.anomaly ? 'Scanning...' : 'Scan for Anomalies'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAnomalies) {
    return (
      <div className='space-y-3'>
        <div className='flex min-h-40 items-center justify-center rounded-lg bg-muted/30'>
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
            disabled={loading.anomaly}
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
          <div className='min-w-0 flex-1'>
            <div className='mb-1 text-sm font-medium'>
              {currentAnomaly.column}
            </div>
            <p className='text-sm leading-relaxed text-muted-foreground'>
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
          <Button variant='outline' size='sm' onClick={handlePrevious}>
            Previous
          </Button>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {currentIndex + 1} / {totalAnomalies}
            </span>
          </div>

          <Button variant='outline' size='sm' onClick={handleNext}>
            Next
          </Button>
        </div>
      )}

      {/* Re-scan and Save */}
      <div className='flex justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleSaveAnomalies}
          disabled={loading.anomaly}
        >
          {isSaved ? '✓ Saved' : 'Save'}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={handleDetectAnomalies}
          disabled={loading.anomaly}
        >
          Re-scan
        </Button>
      </div>
    </div>
  )
}
