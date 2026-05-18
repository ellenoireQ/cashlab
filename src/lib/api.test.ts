import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  API_ENDPOINTS,
  uploadCsvFile,
  apiFetch,
  checkApiHealth,
  type CsvToArrayResponse,
} from './api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API_ENDPOINTS', () => {
    it('should have correct convert endpoint structure', () => {
      expect(API_ENDPOINTS.convert.csvToArray(true)).toContain(
        '/api/convert/csv-to-array?use_headers=true'
      )
      expect(API_ENDPOINTS.convert.csvToArray(false)).toContain(
        '/api/convert/csv-to-array?use_headers=false'
      )
    })

    it('should have root and hello endpoints', () => {
      expect(API_ENDPOINTS.root).toBeDefined()
      expect(API_ENDPOINTS.hello).toContain('/api/hello')
    })
  })

  describe('uploadCsvFile', () => {
    it('should upload CSV file successfully', async () => {
      const mockResponse: CsvToArrayResponse = {
        data: [
          { name: 'John', age: '30' },
          { name: 'Jane', age: '25' },
        ],
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const file = new File(['name,age\nJohn,30\nJane,25'], 'test.csv', {
        type: 'text/csv',
      })

      const result = await uploadCsvFile(file, true)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/convert/csv-to-array?use_headers=true'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    it('should handle upload errors', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid CSV format' }),
      })

      const file = new File(['invalid'], 'test.csv', { type: 'text/csv' })

      await expect(uploadCsvFile(file, true)).rejects.toThrow(
        'Invalid CSV format'
      )
    })

    it('should use default useHeaders parameter', async () => {
      const mockResponse: CsvToArrayResponse = { data: [] }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const file = new File([''], 'test.csv', { type: 'text/csv' })
      await uploadCsvFile(file)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('use_headers=true'),
        expect.any(Object)
      )
    })
  })

  describe('apiFetch', () => {
    it('should fetch data successfully', async () => {
      const mockData = { message: 'Success' }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await apiFetch<{ message: string }>('/api/test')

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle fetch errors', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Not found' }),
      })

      await expect(apiFetch('/api/test')).rejects.toThrow('Not found')
    })

    it('should handle unknown errors', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Parse error')
        },
      })

      await expect(apiFetch('/api/test')).rejects.toThrow(
        'An unknown error occurred'
      )
    })

    it('should merge custom headers', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await apiFetch('/api/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          }),
        })
      )
    })
  })

  describe('checkApiHealth', () => {
    it('should check API health successfully', async () => {
      const mockResponse = { message: 'Hello from Cashlab API!' }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await checkApiHealth()

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/hello'),
        expect.any(Object)
      )
    })
  })
})
