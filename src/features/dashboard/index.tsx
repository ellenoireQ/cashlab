import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export function Dashboard() {
  const [data, setData] = React.useState<Record<string, unknown>[]>([])
  const [headers, setHeaders] = React.useState<string[]>([])
  const [visible, setVisible] = React.useState<Record<string, boolean>>({})
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch(
        'http://localhost:8000/api/convert/csv-to-array?use_headers=true',
        {
          method: 'POST',
          body: fd,
        }
      )
      const json = await res.json()
      const rows = (json?.data ?? []) as Record<string, unknown>[]
      const nextHeaders = rows.length ? Object.keys(rows[0]) : []

      setData(rows)
      setHeaders(nextHeaders)
      setVisible(
        nextHeaders.reduce<Record<string, boolean>>((acc, header) => {
          acc[header] = true
          return acc
        }, {})
      )
    } catch (err) {
      console.error('CSV upload failed', err)
    } finally {
      e.target.value = ''
    }
  }

  function toggleHeader(key: string) {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function showOnly(key: string) {
    setVisible(
      headers.reduce<Record<string, boolean>>((acc, header) => {
        acc[header] = header === key
        return acc
      }, {})
    )
  }

  function showAll() {
    setVisible(
      headers.reduce<Record<string, boolean>>((acc, header) => {
        acc[header] = true
        return acc
      }, {})
    )
  }

  function clearCsv() {
    setData([])
    setHeaders([])
    setVisible({})
  }

  const headerCards = headers.slice(0, 4)

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
              {headerCards.map((header) => (
                <Card key={header}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {header}
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
                        <DropdownMenuLabel>Header: {header}</DropdownMenuLabel>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {String(data[0]?.[header] ?? '').slice(0, 16) || '-'}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {visible[header] ? 'Visible header' : 'Hidden header'}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
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
