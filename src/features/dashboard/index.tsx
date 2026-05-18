import * as React from 'react'
import { Eye, EyeOff, GripVertical, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { uploadCsvFile } from '@/lib/api'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { AnomalyDetection } from './components/anomaly-detection'

export function Dashboard() {
  const [data, setData] = React.useState<Record<string, unknown>[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [visible, setVisible] = React.useState<Record<string, boolean>>({})
  const [aggregation, setAggregation] = React.useState<
    Record<string, 'sum' | null>
  >({})
  const [primaryHeaders, setPrimaryHeaders] = React.useState<string[]>([])
  const [draggedPrimaryHeader, setDraggedPrimaryHeader] = React.useState<
    string | null
  >(null)
  const [dragOverlayPosition, setDragOverlayPosition] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const [dragOverPrimaryHeader, setDragOverPrimaryHeader] = React.useState<
    string | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const response = await uploadCsvFile(file, true)
      const rows = response.data
      const nextHeaders = rows.length ? Object.keys(rows[0]) : []

      setData(rows)
      setHeaders(nextHeaders)
      setVisible(
        nextHeaders.reduce<Record<string, boolean>>((acc, header) => {
          acc[header] = true
          return acc
        }, {})
      )
      setError(null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'CSV upload failed'
      setError(errorMessage)
    } finally {
      e.target.value = ''
    }
  }

  function toggleHeader(key: string) {
    setVisible((prev) => {
      const currently = !!prev[key]
      const selectedCount = Object.values(prev).filter(Boolean).length
      const nextCount = selectedCount + (currently ? -1 : 1)
      if (nextCount < 4) {
        setError('Pilih minimal 4 headers')
        return prev
      }
      setError(null)
      const next = { ...prev, [key]: !currently }
      // if being turned off, remove from primaryHeaders
      if (currently && !next[key]) {
        setPrimaryHeaders((prevP) => prevP.filter((p) => p !== key))
      }
      return next
    })
  }

  function showOnly(_key: string) {
    // Disallow showing only one header because we require at least 4 selected
    setError('Pilih minimal 4 headers')
  }

  function showAll() {
    setVisible(
      headers.reduce<Record<string, boolean>>((acc, header) => {
        acc[header] = true
        return acc
      }, {})
    )
    setError(null)
  }

  function clearCsv() {
    setData([])
    setHeaders([])
    setVisible({})
    setAggregation({})
    setPrimaryHeaders([])
    setDraggedPrimaryHeader(null)
    setDragOverlayPosition(null)
    setDragOverPrimaryHeader(null)
  }

  function reorderPrimaryHeaders(activeHeader: string, overHeader: string) {
    if (activeHeader === overHeader) return

    // If both are in primaryHeaders, reorder within primaryHeaders
    const activeInPrimary = primaryHeaders.includes(activeHeader)
    const overInPrimary = primaryHeaders.includes(overHeader)

    if (activeInPrimary && overInPrimary) {
      setPrimaryHeaders((prev) => {
        const activeIndex = prev.indexOf(activeHeader)
        const overIndex = prev.indexOf(overHeader)

        if (activeIndex < 0 || overIndex < 0) return prev

        const next = [...prev]
        next.splice(activeIndex, 1)
        next.splice(overIndex, 0, activeHeader)
        return next
      })
    } else {
      // If dragging non-primary or mixing, add both to primaryHeaders and reorder
      setPrimaryHeaders((prev) => {
        let next = [...prev]
        
        // Add activeHeader if not in primary
        if (!next.includes(activeHeader)) {
          next.push(activeHeader)
        }
        
        // Add overHeader if not in primary
        if (!next.includes(overHeader)) {
          next.push(overHeader)
        }
        
        // Now reorder
        const activeIndex = next.indexOf(activeHeader)
        const overIndex = next.indexOf(overHeader)
        
        next.splice(activeIndex, 1)
        next.splice(overIndex, 0, activeHeader)
        
        return next
      })
      
      // Ensure both headers are visible
      setVisible((prev) => ({
        ...prev,
        [activeHeader]: true,
        [overHeader]: true,
      }))
    }
  }

  function handlePrimaryHeaderDragStart(header: string) {
    setDraggedPrimaryHeader(header)
  }

  function handlePrimaryHeaderDragMove(
    header: string,
    event: React.DragEvent<HTMLDivElement>
  ) {
    if (draggedPrimaryHeader !== header) return
    setDragOverlayPosition({ x: event.clientX, y: event.clientY })
  }

  function handlePrimaryHeaderDrop(overHeader: string) {
    if (!draggedPrimaryHeader) return
    reorderPrimaryHeaders(draggedPrimaryHeader, overHeader)
    setDraggedPrimaryHeader(null)
    setDragOverlayPosition(null)
    setDragOverPrimaryHeader(null)
  }

  function handlePrimaryHeaderDragEnd() {
    setDraggedPrimaryHeader(null)
    setDragOverlayPosition(null)
    setDragOverPrimaryHeader(null)
  }

  // Build header cards list: primaryHeaders (if visible) first, then up to 4 total.
  const visibleList = headers.filter((h) => visible[h])
  const headerCards: string[] = []
  for (const ph of primaryHeaders) {
    if (visible[ph] && !headerCards.includes(ph)) headerCards.push(ph)
    if (headerCards.length >= 4) break
  }
  for (const h of visibleList) {
    if (headerCards.length >= 4) break
    if (!headerCards.includes(h)) headerCards.push(h)
  }
  // fallback to first headers if still empty
  if (headerCards.length === 0) headerCards.push(...headers.slice(0, 4))

  function parseNumber(value: unknown): number | null {
    if (value === null || typeof value === 'undefined') return null
    if (typeof value === 'number') return Number(value)
    const s = String(value).trim()
    if (s === '') return null
    // remove currency symbols and spaces, keep digits, dots and minus
    const cleaned = s.replace(/[^0-9.-]+/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  function computeSumForHeader(header: string) {
    if (!data || data.length === 0) return null
    let anyNumeric = false
    const sum = data.reduce((acc, row) => {
      const v = parseNumber(row[header])
      if (v !== null) {
        anyNumeric = true
        return acc + v
      }
      return acc
    }, 0)
    return anyNumeric ? sum : null
  }

  function isHeaderNumeric(header: string): boolean {
    if (!data || data.length === 0) return false
    
    // Check if at least 50% of non-empty values in the column are numeric
    let numericCount = 0
    let nonEmptyCount = 0
    
    for (const row of data) {
      const value = row[header]
      if (value === null || value === undefined || String(value).trim() === '') {
        continue
      }
      
      nonEmptyCount++
      
      // Check if value is already a number type
      if (typeof value === 'number') {
        numericCount++
        continue
      }
      
      // For strings, check if it looks like a number (with optional currency/formatting)
      const s = String(value).trim()
      // Remove common currency symbols and thousand separators
      const cleaned = s.replace(/[$€£¥,\s]/g, '')
      
      // Check if the cleaned string is a valid number
      // Must start with optional minus, then digits, optional decimal point and more digits
      if (/^-?\d+\.?\d*$/.test(cleaned) && cleaned !== '' && cleaned !== '-') {
        const n = Number(cleaned)
        if (Number.isFinite(n)) {
          numericCount++
        }
      }
    }
    
    // Consider numeric if at least 50% of non-empty values are numeric
    return nonEmptyCount > 0 && numericCount / nonEmptyCount >= 0.5
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        {draggedPrimaryHeader && dragOverlayPosition && (
          <div
            className='pointer-events-none fixed z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2'
            style={{
              left: dragOverlayPosition.x,
              top: dragOverlayPosition.y,
            }}
          >
            <Card className='border-primary/40 bg-background/95 shadow-2xl backdrop-blur-sm'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='flex items-center gap-1 text-sm font-medium'>
                  <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <span>{draggedPrimaryHeader}</span>
                </CardTitle>
                <span className='text-xs text-muted-foreground'>Dragging</span>
              </CardHeader>
              <CardContent>
                <div className='flex items-start justify-between'>
                  <div className='text-2xl font-bold'>
                    {aggregation[draggedPrimaryHeader] === 'sum'
                      ? (() => {
                          const sum = computeSumForHeader(draggedPrimaryHeader)
                          return sum !== null ? sum.toLocaleString() : '-'
                        })()
                      : String(data[0]?.[draggedPrimaryHeader] ?? '').slice(
                          0,
                          16
                        ) || '-'}
                  </div>
                  {isHeaderNumeric(draggedPrimaryHeader) && (
                    <div className='h-8 w-8 shrink-0 flex items-center justify-center'>
                      {aggregation[draggedPrimaryHeader] === 'sum' ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </div>
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {aggregation[draggedPrimaryHeader] === 'sum'
                    ? 'Sum of column'
                    : visible[draggedPrimaryHeader]
                      ? 'Visible header'
                      : 'Hidden header'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='.csv,text/csv'
              onChange={handleFileChange}
              className='hidden'
            />
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
            >
              Import CSV
            </Button>
            <Button>Download</Button>
            {headers.length > 0 && (
              <div className='ms-3 flex items-center'>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Settings2 className='h-4 w-4' />
                      <span className='sr-only'>View options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-72'>
                    <DropdownMenuLabel>View Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setVisible(
                          headers.reduce<Record<string, boolean>>((acc, h) => {
                            acc[h] = true
                            return acc
                          }, {})
                        )
                        setError(null)
                      }}
                    >
                      Show all
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        // Hiding all would violate min-4 rule
                        setError('Pilih minimal 4 headers')
                      }}
                    >
                      Hide all
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className='max-h-60 overflow-auto'>
                      {headers.map((h) => {
                        // Check if this header is currently displayed as a card
                        const isDisplayedAsCard = headerCards.includes(h)
                        
                        return (
                          <div
                            key={h}
                            className='flex items-center justify-between px-2 py-1.5'
                          >
                            <span className='flex-1 text-sm capitalize'>
                              {h}
                            </span>
                            <Checkbox
                              aria-label={`Display ${h} as card`}
                              checked={isDisplayedAsCard}
                              onCheckedChange={(v) => {
                                const isChecked = !!v
                                if (isChecked) {
                                  setPrimaryHeaders((prevP) =>
                                    prevP.includes(h) ? prevP : [...prevP, h]
                                  )
                                  setVisible((prev) => ({ ...prev, [h]: true }))
                                  setError(null)
                                } else {
                                  setPrimaryHeaders((prevP) =>
                                    prevP.filter((p) => p !== h)
                                  )
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {error && <p className='ms-2 text-sm text-red-600'>{error}</p>}
              </div>
            )}
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {headerCards.map((header) => {
                const sum = computeSumForHeader(header)
                const isDraggedOver = dragOverPrimaryHeader === header
                const isNumeric = isHeaderNumeric(header)
                const isShowingSum = aggregation[header] === 'sum'
                return (
                  <Card
                    key={header}
                    draggable={true}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', header)
                      setDragOverlayPosition({
                        x: event.clientX,
                        y: event.clientY,
                      })
                      handlePrimaryHeaderDragStart(header)
                    }}
                    onDrag={(event) => {
                      setDragOverlayPosition({
                        x: event.clientX,
                        y: event.clientY,
                      })
                    }}
                    onDragEnd={handlePrimaryHeaderDragEnd}
                    onDragOver={(event) => {
                      event.preventDefault()
                      handlePrimaryHeaderDragMove(header, event)
                      setDragOverPrimaryHeader(header)
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault()
                      handlePrimaryHeaderDragMove(header, event)
                      setDragOverPrimaryHeader(header)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      handlePrimaryHeaderDrop(header)
                    }}
                    className='transition-shadow'
                  >
                    <CardHeader
                      className={`flex flex-row items-center justify-between space-y-0 pb-2 cursor-grab select-none active:cursor-grabbing ${
                        isDraggedOver ? 'rounded-md ring-2 ring-primary/40' : ''
                      }`}
                      title='Drag to reorder this header'
                    >
                      <CardTitle className='flex items-center gap-1 text-sm font-medium'>
                        <GripVertical className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span>{header}</span>
                      </CardTitle>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            aria-label={`Header options for ${header}`}
                          >
                            <span className='text-lg leading-none'>⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-44'>
                          <DropdownMenuLabel>
                            Header: {header}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={!!visible[header]}
                            onCheckedChange={() => toggleHeader(header)}
                          >
                            Visible
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuItem onSelect={() => showOnly(header)}>
                            Show only this
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={showAll}>
                            Show all
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() =>
                              setAggregation((prev) => ({
                                ...prev,
                                [header]: 'sum',
                              }))
                            }
                          >
                            Sum column
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              setAggregation((prev) => ({
                                ...prev,
                                [header]: null,
                              }))
                            }
                          >
                            Clear aggregation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-start justify-between'>
                        <div className='text-2xl font-bold'>
                          {aggregation[header] === 'sum'
                            ? sum !== null
                              ? sum.toLocaleString()
                              : '-'
                            : String(data[0]?.[header] ?? '').slice(0, 16) ||
                              '-'}
                        </div>
                        {isNumeric && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 shrink-0'
                            onMouseEnter={() => {
                              setAggregation((prev) => ({
                                ...prev,
                                [header]: 'sum',
                              }))
                            }}
                            onMouseLeave={() => {
                              setAggregation((prev) => ({
                                ...prev,
                                [header]: null,
                              }))
                            }}
                            aria-label={`Show sum for ${header} on hover`}
                            title='Hover to show sum'
                          >
                            {isShowingSum ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {aggregation[header] === 'sum'
                          ? 'Sum of column'
                          : visible[header]
                            ? 'Visible header'
                            : 'Hidden header'}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview
                    data={data}
                    headers={headers}
                    visible={visible}
                    onClear={clearCsv}
                  />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>
                    AI-powered detection of unusual patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnomalyDetection data={data} headers={headers} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics data={data} headers={headers} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
