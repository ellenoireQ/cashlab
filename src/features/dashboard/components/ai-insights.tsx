import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  analyzeDataWithAI,
  generateAISummary,
  type AIInsight,
} from '@/lib/api'

interface AIInsightsProps {
  data: Record<string, unknown>[]
  headers: string[]
}

export function AIInsights({ data, headers }: AIInsightsProps) {
  const [loadingSummary, setLoadingSummary] = React.useState(false)
  const [loadingOverview, setLoadingOverview] = React.useState(false)
  const [loadingTrends, setLoadingTrends] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [generalInsights, setGeneralInsights] = React.useState<AIInsight | null>(
    null
  )
  const [trends, setTrends] = React.useState<AIInsight | null>(null)

  const hasData = data.length > 0 && headers.length > 0

  async function handleAnalyzeOverview() {
    if (!hasData) return

    setLoadingOverview(true)
    setError(null)

    try {
      const result = await analyzeDataWithAI(data, headers, 'general')

      if (result.success) {
        setGeneralInsights(result.insights)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data')
    } finally {
      setLoadingOverview(false)
    }
  }

  async function handleAnalyzeTrends() {
    if (!hasData) return

    setLoadingTrends(true)
    setError(null)

    try {
      const result = await analyzeDataWithAI(data, headers, 'trend')

      if (result.success) {
        setTrends(result.insights)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data')
    } finally {
      setLoadingTrends(false)
    }
  }

  async function handleGenerateSummary() {
    if (!hasData) return

    setLoadingSummary(true)
    setError(null)

    try {
      const result = await generateAISummary(data, headers)
      if (result.success) {
        setSummary(result.summary)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  React.useEffect(() => {
    // Auto-generate all analyses when data changes
    if (hasData && !summary && !generalInsights && !trends) {
      handleGenerateSummary()
      handleAnalyzeOverview()
      handleAnalyzeTrends()
    }
  }, [data, headers])

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>
            Intelligent analysis of your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
            <p className='text-sm text-muted-foreground'>
              Import CSV data to generate insights
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      {(loadingSummary || summary) && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary && !summary ? (
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            ) : (
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {summary}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Insights & Recommendations */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Key Insights */}
        {(loadingOverview || generalInsights?.key_insights) && (
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview && !generalInsights ? (
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              ) : generalInsights?.key_insights ? (
                <ul className='space-y-3'>
                  {generalInsights.key_insights.map((insight, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2 text-sm leading-relaxed'
                    >
                      <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                      <span className='text-muted-foreground'>{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {(loadingOverview || generalInsights?.recommendations) && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview && !generalInsights ? (
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              ) : generalInsights?.recommendations ? (
                <ul className='space-y-3'>
                  {generalInsights.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2 text-sm leading-relaxed'
                    >
                      <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600' />
                      <span className='text-muted-foreground'>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trends */}
      {(loadingTrends || trends) && (
        <Card>
          <CardHeader>
            <CardTitle>Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTrends && !trends ? (
              <div className='space-y-3'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
              </div>
            ) : trends ? (
              <div className='space-y-4'>
                {/* Trend Items */}
                {trends.trends && trends.trends.length > 0 && (
                  <div className='space-y-3'>
                    {trends.trends.map((trend, i) => (
                      <div
                        key={i}
                        className='rounded-lg border bg-muted/30 p-3'
                      >
                        <div className='mb-2 flex items-start justify-between gap-2'>
                          <h5 className='text-sm font-medium'>{trend.column}</h5>
                          <div className='flex gap-1.5'>
                            <Badge variant='outline' className='text-xs'>
                              {trend.type}
                            </Badge>
                            <Badge
                              variant={
                                trend.confidence === 'high'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className='text-xs'
                            >
                              {trend.confidence}
                            </Badge>
                          </div>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {trend.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Correlations */}
                {trends.correlations && trends.correlations.length > 0 && (
                  <div>
                    <h5 className='mb-2 text-sm font-medium'>Correlations</h5>
                    <ul className='space-y-2'>
                      {trends.correlations.map((corr, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-2 text-sm'
                        >
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                          <span className='text-muted-foreground'>{corr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Predictions */}
                {trends.predictions && trends.predictions.length > 0 && (
                  <div>
                    <h5 className='mb-2 text-sm font-medium'>Predictions</h5>
                    <ul className='space-y-2'>
                      {trends.predictions.map((pred, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-2 text-sm'
                        >
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600' />
                          <span className='text-muted-foreground'>{pred}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className='flex justify-end pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleAnalyzeTrends}
                    disabled={loadingTrends}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Data Quality */}
      {generalInsights?.data_quality && (
        <Card>
          <CardHeader>
            <CardTitle>Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {generalInsights.data_quality}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
