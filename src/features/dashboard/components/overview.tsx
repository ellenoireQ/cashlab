import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type OverviewProps = {
  data: Record<string, unknown>[]
  headers: string[]
  visible: Record<string, boolean>
  onClear: () => void
}

export function Overview({ data, headers, visible, onClear }: OverviewProps) {
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const visibleHeaders = headers.filter((header) => visible[header])
  const isEmptyState = headers.length === 0 || data.length === 0
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))

  React.useEffect(() => {
    setPageIndex(0)
  }, [data, headers])

  React.useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1))
    }
  }, [pageIndex, totalPages])

  const pageNumbers = getPageNumbers(pageIndex + 1, totalPages)
  const paginatedRows = React.useMemo(
    () => data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [data, pageIndex, pageSize]
  )

  return (
    <div className='space-y-4'>
      {isEmptyState ? (
        <div className='flex min-h-48 items-center justify-center rounded-xl bg-muted/30 px-6 py-12 text-center'>
          <div className='max-w-md space-y-2'>
            <p className='text-base font-medium text-foreground'>
              Getting started
            </p>
            <p className='text-sm text-muted-foreground'>
              Import a CSV file to display your header cards and table data.
            </p>
          </div>
        </div>
      ) : null}

      {/* Tables */}
      {data && data.length > 0 && (
        <div className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-muted-foreground'>
              Showing {pageIndex * pageSize + 1}-
              {Math.min((pageIndex + 1) * pageSize, data.length)} of{' '}
              {data.length} rows
            </p>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>
                Rows per page
              </span>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className='h-8 w-20'>
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side='top'>
                  {[5, 10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='max-h-104 overflow-auto rounded-xl border'>
            <table className='w-full min-w-max border-separate border-spacing-0'>
              <thead className='sticky top-0 z-10 bg-background'>
                <tr>
                  {visibleHeaders.map((h) => (
                    <th
                      key={h}
                      className='border-b px-3 py-2 text-left text-sm font-medium whitespace-nowrap'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/5' : ''}>
                    {visibleHeaders.map((h) => (
                      <td
                        key={h}
                        className='border-b px-3 py-2 text-sm whitespace-nowrap'
                      >
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() =>
                  setPageIndex((current) => Math.max(current - 1, 0))
                }
                disabled={pageIndex === 0}
              >
                <ChevronLeftIcon className='h-4 w-4' />
                <span className='sr-only'>Previous page</span>
              </Button>
              {pageNumbers.map((pageNumber, index) =>
                pageNumber === '...' ? (
                  <span
                    key={`dots-${index}`}
                    className='px-1 text-sm text-muted-foreground'
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNumber}
                    variant={
                      pageNumber === pageIndex + 1 ? 'default' : 'outline'
                    }
                    size='icon'
                    className='size-8 text-sm'
                    onClick={() => setPageIndex((pageNumber as number) - 1)}
                  >
                    {pageNumber}
                  </Button>
                )
              )}
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() =>
                  setPageIndex((current) =>
                    Math.min(current + 1, totalPages - 1)
                  )
                }
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronRightIcon className='h-4 w-4' />
                <span className='sr-only'>Next page</span>
              </Button>
            </div>

            <p className='text-sm text-muted-foreground'>
              Page {pageIndex + 1} of {totalPages}
            </p>
          </div>
        </div>
      )}

      {!isEmptyState && headers.length > 0 && (
        <div className='flex justify-end'>
          <button
            type='button'
            className='text-sm text-muted-foreground underline-offset-4 hover:underline'
            onClick={onClear}
          >
            Clear imported CSV
          </button>
        </div>
      )}
    </div>
  )
}
