import * as React from 'react'
import {
  FileUp,
  FileDown,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  FileSpreadsheet,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export type ActivityType =
  | 'import'
  | 'export'
  | 'show_header'
  | 'hide_header'
  | 'clear'
  | 'settings'
  | 'view_change'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  metadata?: {
    fileName?: string
    headerName?: string
    rowCount?: number
  }
}

interface RecentActivityProps {
  activities?: Activity[]
  maxItems?: number
}

const activityConfig: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    label: string
  }
> = {
  import: {
    icon: FileUp,
    color: 'text-foreground',
    bgColor: 'bg-green-100 dark:bg-green-950',
    label: 'Import',
  },
  export: {
    icon: FileDown,
    color: 'text-foreground',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    label: 'Export',
  },
  show_header: {
    icon: Eye,
    color: 'text-foreground',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    label: 'Show',
  },
  hide_header: {
    icon: EyeOff,
    color: 'text-foreground',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    label: 'Hide',
  },
  clear: {
    icon: Trash2,
    color: 'text-foreground',
    bgColor: 'bg-red-100 dark:bg-red-950',
    label: 'Clear',
  },
  settings: {
    icon: Settings,
    color: 'text-foreground',
    bgColor: 'bg-gray-100 dark:bg-gray-950',
    label: 'Settings',
  },
  view_change: {
    icon: FileSpreadsheet,
    color: 'text-foreground',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    label: 'View',
  },
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function RecentActivity({
  activities = [],
  maxItems = 5,
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
        <div className='text-center'>
          <FileSpreadsheet className='mx-auto h-8 w-8 text-muted-foreground/50' />
          <p className='mt-2 text-sm text-muted-foreground'>
            No activity yet
          </p>
          <p className='text-xs text-muted-foreground'>
            Import a CSV to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {displayedActivities.map((activity) => {
        const config = activityConfig[activity.type]
        const Icon = config.icon

        return (
          <div key={activity.id} className='flex items-start gap-4'>
            <Avatar
              className={`flex h-9 w-9 items-center justify-center ${config.bgColor}`}
            >
              <AvatarFallback className={`${config.bgColor} ${config.color}`}>
                <Icon className='h-4 w-4' />
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-1 flex-col gap-1'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 space-y-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium leading-none'>
                      {activity.title}
                    </p>
                    <Badge
                      variant='secondary'
                      className='h-5 px-1.5 text-xs font-normal'
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {activity.description}
                  </p>
                  {activity.metadata && (
                    <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
                      {activity.metadata.fileName && (
                        <span className='rounded bg-muted px-1.5 py-0.5 font-mono'>
                          {activity.metadata.fileName}
                        </span>
                      )}
                      {activity.metadata.rowCount !== undefined && (
                        <span>
                          {activity.metadata.rowCount.toLocaleString()} rows
                        </span>
                      )}
                      {activity.metadata.headerName && (
                        <span className='rounded bg-muted px-1.5 py-0.5'>
                          {activity.metadata.headerName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <time className='text-xs text-muted-foreground whitespace-nowrap'>
                  {formatRelativeTime(activity.timestamp)}
                </time>
              </div>
            </div>
          </div>
        )
      })}

      {activities.length > maxItems && (
        <div className='text-center'>
          <button
            type='button'
            className='text-sm text-muted-foreground underline-offset-4 hover:underline'
          >
            View all {activities.length} activities
          </button>
        </div>
      )}
    </div>
  )
}
