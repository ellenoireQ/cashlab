# API Library

This directory contains API configuration and helper functions for communicating with the backend.

## Files

### `api.ts`
Central API configuration file that contains:
- **API_ENDPOINTS**: Registry of all backend API endpoints
- **Type definitions**: TypeScript interfaces for API requests/responses
- **Helper functions**: Reusable functions for API calls

## Usage

### Importing API Functions

```typescript
import { uploadCsvFile, API_ENDPOINTS, checkApiHealth } from '@/lib/api'
```

### Upload CSV File

```typescript
const file = // ... get file from input
try {
  const response = await uploadCsvFile(file, true) // true = use headers
  console.log(response.data) // Array of objects
} catch (error) {
  console.error('Upload failed:', error.message)
}
```

### Using API Endpoints Directly

```typescript
import { API_ENDPOINTS } from '@/lib/api'

// Get endpoint URL
const url = API_ENDPOINTS.convert.csvToArray(true)

// Make custom fetch call
const response = await fetch(url, {
  method: 'POST',
  body: formData,
})
```

### Generic API Fetch

```typescript
import { apiFetch } from '@/lib/api'

interface MyResponse {
  data: string[]
}

const result = await apiFetch<MyResponse>('/api/my-endpoint', {
  method: 'GET',
})
```

## Environment Variables

Configure the API base URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000`.

## Adding New Endpoints

When adding new backend endpoints, register them in `api.ts`:

```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // Add new endpoint group
  myNewFeature: {
    getData: `${API_BASE_URL}/api/my-feature/data`,
    postData: `${API_BASE_URL}/api/my-feature/submit`,
  },
} as const
```

Then create a helper function:

```typescript
export async function submitMyData(data: MyDataType): Promise<MyResponseType> {
  return apiFetch(API_ENDPOINTS.myNewFeature.postData, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

## Best Practices

1. **Always use API_ENDPOINTS** - Don't hardcode URLs in components
2. **Create helper functions** - Wrap common API calls in reusable functions
3. **Type your responses** - Define TypeScript interfaces for API responses
4. **Handle errors** - Use try/catch blocks and provide meaningful error messages
5. **Use environment variables** - Configure base URL via `.env` for different environments

## Error Handling

All API functions throw errors with meaningful messages. Always wrap calls in try/catch:

```typescript
try {
  const result = await uploadCsvFile(file)
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message)
    // Show error to user
  }
}
```
