import { RefreshCw } from 'lucide-react'
import { useAnalysisCache } from '@/hooks/use-analysis-cache'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MarkdownContent } from '@/components/markdown-content'

interface AIInsightsProps {
  data: Record<string, unknown>[]
  headers: string[]
}

export function AIInsights({ data, headers }: AIInsightsProps) {
  const {
    cache,
    loading,
    error,
    regenerateSummary,
    regenerateOverview,
    regenerateTrends,
  } = useAnalysisCache(data, headers)

  const hasData = data.length > 0 && headers.length > 0
  const { summary } = cache
  const { generalInsights } = cache
  const { trends } = cache

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
      {(loading.summary || summary) && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <div>
              <CardTitle>Summary</CardTitle>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={regenerateSummary}
              disabled={loading.summary}
              className='h-8 w-8 p-0'
              title='Regenerate summary'
            >
              <RefreshCw
                className={`h-4 w-4 ${loading.summary ? 'animate-spin' : ''}`}
              />
            </Button>
          </CardHeader>
          <CardContent>
            {loading.summary && !summary ? (
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            ) : summary ? (
              <MarkdownContent content={summary} />
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Key Insights & Recommendations */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Key Insights */}
        {(loading.overview || generalInsights?.key_insights) && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <CardTitle>Key Insights</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={regenerateOverview}
                disabled={loading.overview}
                className='h-8 w-8 p-0'
                title='Regenerate insights'
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading.overview ? 'animate-spin' : ''}`}
                />
              </Button>
            </CardHeader>
            <CardContent>
              {loading.overview && !generalInsights ? (
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
                      <div className='flex-1'>
                        <MarkdownContent content={insight} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {(loading.overview || generalInsights?.recommendations) && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0'>
              <CardTitle>Recommendations</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={regenerateOverview}
                disabled={loading.overview}
                className='h-8 w-8 p-0'
                title='Regenerate recommendations'
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading.overview ? 'animate-spin' : ''}`}
                />
              </Button>
            </CardHeader>
            <CardContent>
              {loading.overview && !generalInsights ? (
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
                      <div className='flex-1'>
                        <MarkdownContent content={rec} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trends */}
      {(loading.trends || trends) && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle>Trends</CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={regenerateTrends}
              disabled={loading.trends}
              className='h-8 w-8 p-0'
              title='Regenerate trends'
            >
              <RefreshCw
                className={`h-4 w-4 ${loading.trends ? 'animate-spin' : ''}`}
              />
            </Button>
          </CardHeader>
          <CardContent>
            {loading.trends && !trends ? (
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
                          <h5 className='text-sm font-medium'>
                            {trend.column}
                          </h5>
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
                        <MarkdownContent content={trend.description} />
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
                        <li key={i} className='flex items-start gap-2 text-sm'>
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                          <div className='flex-1'>
                            <MarkdownContent content={corr} />
                          </div>
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
                        <li key={i} className='flex items-start gap-2 text-sm'>
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600' />
                          <div className='flex-1'>
                            <MarkdownContent content={pred} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
            <MarkdownContent content={generalInsights.data_quality} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
