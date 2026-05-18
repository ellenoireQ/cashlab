import * as React from 'react'
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = React.useState<string>('overview')

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
    // Auto-generate summary when data changes
    if (hasData && !summary) {
      handleGenerateSummary()
    }
  }, [data, headers])

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            AI Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
            <div className='text-center'>
              <Sparkles className='mx-auto h-8 w-8 text-muted-foreground/50' />
              <p className='mt-2 text-sm text-muted-foreground'>
                Import CSV data to get AI insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            AI Summary
          </CardTitle>
          <CardDescription>
            Quick overview of your dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSummary && !summary ? (
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ) : summary ? (
            <p className='text-sm leading-relaxed'>{summary}</p>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
            >
              Generate Summary
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Deep dive into your data with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='overview'>
                <Lightbulb className='mr-2 h-4 w-4' />
                Overview
              </TabsTrigger>
              <TabsTrigger value='trends'>
                <TrendingUp className='mr-2 h-4 w-4' />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-4'>
              {!generalInsights ? (
                <div className='py-8 text-center'>
                  <Button
                    onClick={handleAnalyzeOverview}
                    disabled={loadingOverview}
                  >
                    <Sparkles className='mr-2 h-4 w-4' />
                    Generate Insights
                  </Button>
                </div>
              ) : loadingOverview ? (
                <div className='space-y-4'>
                  <div className='space-y-3'>
                    <Skeleton className='h-6 w-32' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                  </div>
                  <div className='space-y-3'>
                    <Skeleton className='h-6 w-32' />
                    <Skeleton className='h-20 w-full' />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {generalInsights.key_insights && (
                    <div>
                      <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                        Key Insights
                      </h4>
                      <ul className='space-y-2'>
                        {generalInsights.key_insights.map((insight, i) => (
                          <li
                            key={i}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generalInsights.data_quality && (
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Data Quality
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {generalInsights.data_quality}
                      </p>
                    </div>
                  )}

                  {generalInsights.recommendations && (
                    <div>
                      <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                        <Lightbulb className='h-4 w-4 text-yellow-600' />
                        Recommendations
                      </h4>
                      <ul className='space-y-2'>
                        {generalInsights.recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-600' />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleAnalyzeOverview}
                    disabled={loadingOverview}
                  >
                    Refresh Analysis
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value='trends' className='space-y-4'>
              {!trends ? (
                <div className='py-8 text-center'>
                  <Button
                    onClick={handleAnalyzeTrends}
                    disabled={loadingTrends}
                  >
                    <TrendingUp className='mr-2 h-4 w-4' />
                    Analyze Trends
                  </Button>
                </div>
              ) : loadingTrends ? (
                <div className='space-y-4'>
                  <div className='space-y-3'>
                    <Skeleton className='h-6 w-40' />
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-24 w-full' />
                  </div>
                  <div className='space-y-3'>
                    <Skeleton className='h-6 w-32' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {trends.trends && trends.trends.length > 0 && (
                    <div>
                      <h4 className='mb-3 text-sm font-semibold'>
                        Identified Trends
                      </h4>
                      <div className='space-y-3'>
                        {trends.trends.map((trend, i) => (
                          <Card key={i}>
                            <CardHeader className='pb-3'>
                              <div className='flex items-start justify-between'>
                                <CardTitle className='text-sm font-medium'>
                                  {trend.column}
                                </CardTitle>
                                <div className='flex gap-2'>
                                  <Badge variant='outline'>{trend.type}</Badge>
                                  <Badge
                                    variant={
                                      trend.confidence === 'high'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {trend.confidence}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className='pb-3'>
                              <p className='text-sm text-muted-foreground'>
                                {trend.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {trends.correlations && trends.correlations.length > 0 && (
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Correlations
                      </h4>
                      <ul className='space-y-2'>
                        {trends.correlations.map((corr, i) => (
                          <li
                            key={i}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                            <span>{corr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {trends.predictions && trends.predictions.length > 0 && (
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Predictions
                      </h4>
                      <ul className='space-y-2'>
                        {trends.predictions.map((pred, i) => (
                          <li
                            key={i}
                            className='flex items-start gap-2 text-sm'
                          >
                            <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600' />
                            <span>{pred}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleAnalyzeTrends}
                    disabled={loadingTrends}
                  >
                    Refresh Analysis
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
