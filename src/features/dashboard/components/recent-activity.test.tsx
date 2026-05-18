import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentActivity, type Activity } from './recent-activity'

describe('RecentActivity', () => {
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'import',
      title: 'CSV Imported',
      description: 'Successfully imported data.csv',
      timestamp: new Date('2024-01-01T10:00:00'),
      metadata: {
        fileName: 'data.csv',
        rowCount: 100,
      },
    },
    {
      id: '2',
      type: 'show_header',
      title: 'Header Shown',
      description: 'Shown column "Name"',
      timestamp: new Date('2024-01-01T10:05:00'),
      metadata: {
        headerName: 'Name',
      },
    },
    {
      id: '3',
      type: 'hide_header',
      title: 'Header Hidden',
      description: 'Hidden column "Email"',
      timestamp: new Date('2024-01-01T10:10:00'),
      metadata: {
        headerName: 'Email',
      },
    },
    {
      id: '4',
      type: 'clear',
      title: 'Data Cleared',
      description: 'Removed 100 rows from dashboard',
      timestamp: new Date('2024-01-01T10:15:00'),
      metadata: {
        rowCount: 100,
      },
    },
  ]

  it('renders empty state when no activities', () => {
    render(<RecentActivity activities={[]} />)

    expect(screen.getByText('No activity yet')).toBeInTheDocument()
    expect(
      screen.getByText('Import a CSV to get started')
    ).toBeInTheDocument()
  })

  it('renders activities list', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('CSV Imported')).toBeInTheDocument()
    expect(screen.getByText('Header Shown')).toBeInTheDocument()
    expect(screen.getByText('Header Hidden')).toBeInTheDocument()
    expect(screen.getByText('Data Cleared')).toBeInTheDocument()
  })

  it('displays activity descriptions', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(
      screen.getByText('Successfully imported data.csv')
    ).toBeInTheDocument()
    expect(screen.getByText('Shown column "Name"')).toBeInTheDocument()
    expect(screen.getByText('Hidden column "Email"')).toBeInTheDocument()
    expect(
      screen.getByText('Removed 100 rows from dashboard')
    ).toBeInTheDocument()
  })

  it('displays activity badges', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.getByText('Hide')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('displays metadata when available', () => {
    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText('data.csv')).toBeInTheDocument()
    expect(screen.getByText('100 rows')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('respects maxItems prop', () => {
    render(<RecentActivity activities={mockActivities} maxItems={2} />)

    expect(screen.getByText('CSV Imported')).toBeInTheDocument()
    expect(screen.getByText('Header Shown')).toBeInTheDocument()
    expect(screen.queryByText('Header Hidden')).not.toBeInTheDocument()
    expect(screen.queryByText('Data Cleared')).not.toBeInTheDocument()
  })

  it('shows "View all" button when activities exceed maxItems', () => {
    render(<RecentActivity activities={mockActivities} maxItems={2} />)

    expect(screen.getByText('View all 4 activities')).toBeInTheDocument()
  })

  it('does not show "View all" button when activities are within maxItems', () => {
    render(<RecentActivity activities={mockActivities} maxItems={10} />)

    expect(
      screen.queryByText(/View all.*activities/)
    ).not.toBeInTheDocument()
  })

  it('renders all activity types correctly', () => {
    const allTypesActivities: Activity[] = [
      {
        id: '1',
        type: 'import',
        title: 'Import',
        description: 'Import test',
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'export',
        title: 'Export',
        description: 'Export test',
        timestamp: new Date(),
      },
      {
        id: '3',
        type: 'show_header',
        title: 'Show',
        description: 'Show test',
        timestamp: new Date(),
      },
      {
        id: '4',
        type: 'hide_header',
        title: 'Hide',
        description: 'Hide test',
        timestamp: new Date(),
      },
      {
        id: '5',
        type: 'clear',
        title: 'Clear',
        description: 'Clear test',
        timestamp: new Date(),
      },
      {
        id: '6',
        type: 'settings',
        title: 'Settings',
        description: 'Settings test',
        timestamp: new Date(),
      },
      {
        id: '7',
        type: 'view_change',
        title: 'View',
        description: 'View test',
        timestamp: new Date(),
      },
    ]

    render(<RecentActivity activities={allTypesActivities} maxItems={10} />)

    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.getByText('Hide')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('View')).toBeInTheDocument()
  })

  it('handles activities without metadata', () => {
    const activitiesWithoutMetadata: Activity[] = [
      {
        id: '1',
        type: 'settings',
        title: 'Settings Changed',
        description: 'Updated preferences',
        timestamp: new Date(),
      },
    ]

    render(<RecentActivity activities={activitiesWithoutMetadata} />)

    expect(screen.getByText('Settings Changed')).toBeInTheDocument()
    expect(screen.getByText('Updated preferences')).toBeInTheDocument()
  })
})
