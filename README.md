# All-In-One AI - Universal AI Operating System

A unified platform to access 15+ AI models (GPT-4, Claude, Gemini, Grok, etc.) from one dashboard.

## Project Structure

```
├── frontend/web          # Next.js 14 frontend app
│   ├── src/
│   │   ├── app/         # Route handlers and pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── stores/      # Zustand state management
│   │   ├── lib/         # Utilities (API, cache, validators, monitoring)
│   │   └── config/      # Environment configuration
│   └── next.config.js   # Next.js optimization settings
└── backend              # Node.js/Express backend
    └── api/            # RESTful API routes
```

## Quick Start

### Frontend
```bash
cd frontend/web
npm install
npm run dev # Dev server on http://localhost:3000
npm run build # Production build
npm run start # Production server
```

### Backend  
```bash
cd backend
npm install
npm start # Server on http://localhost:3001
```

## Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + custom dark theme
- **State**: Zustand (lightweight store management)
- **HTTP**: Axios with interceptors for auth
- **UI**: Custom components with shadcn patterns

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (via connection)
- **Auth**: JWT tokens with refresh rotation

## Key Features

### Core Utilities

#### API Management (`src/lib/api.ts`)
- Automatic token refresh on 401
- Request/response interceptors
- Organized API endpoints by domain

#### Monitoring (`src/lib/monitoring.ts`)
- Error tracking and logging
- Performance measurements with marks
- Context-aware error reporting

#### Caching (`src/lib/cache.ts`)
- In-memory cache with TTL
- Cache decorator for API calls
- Configurable expiration

#### Validation (`src/lib/validators.ts`)
- Email, password, URL validation
- String length checks
- Number validation

#### Custom Hooks
- `useAsync()` - Handle async operations with state
- `useFetch()` - Fetch wrapper with error handling

## Health Checks

Check system status:
```bash
curl http://localhost:3000/api/health
```

Returns:
```json
{
  "status": "ok",
  "frontend": "running",
  "backend": "up",
  "timestamp": "2026-08-02T12:39:09.748Z"
}
```

## Authentication Flow

1. User enters email/password on `/login`
2. API returns `accessToken` + `refreshToken`
3. Tokens stored in localStorage
4. Authorization header added to all requests
5. On 401: Auto-refresh using refreshToken
6. On refresh fail: Redirect to /login

## Build Optimization

- SWC minification enabled
- No source maps in production
- Font optimization active
- Compression enabled
- 14 routes prerendered as static

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

## Monitoring & Observability

```typescript
import { errorMonitor, performanceMonitor } from '@/lib/monitoring';

// Track errors
errorMonitor.log(error, 'context-name');
errorMonitor.warn('Something might be wrong', 'feature');

// Measure performance
performanceMonitor.startTimer('api-call');
await someAsyncOperation();
performanceMonitor.endTimer('api-call'); // Logs: api-call: 234.56ms
```

## Continuous Auto-Upgrade System

The application includes automated improvements:

1. **Error Monitoring** - Captures and logs all errors
2. **Performance Tracking** - Measures page/API response times  
3. **Cache Management** - Reduces redundant API calls
4. **Input Validation** - Prevents invalid data submission
5. **Health Checks** - Monitors frontend + backend status
6. **Build Optimization** - Keeps production bundle minimal

## Common Tasks

### Add New API Endpoint
```typescript
// In src/lib/api.ts
export const myApi = {
  getData: () => api.get('/endpoint'),
  postData: (d: any) => api.post('/endpoint', d),
};
```

### Create Cached API Call
```typescript
import { withCache } from '@/lib/cache';

const data = await withCache('unique-key', () => api.get('/data'), 5 * 60 * 1000);
```

### Validate User Input
```typescript
import { validators } from '@/lib/validators';

if (!validators.email(email)) setError('Invalid email');
const { valid, errors } = validators.password(password);
```

## Troubleshooting

**App won't start**: Check if ports 3000/3001 are in use
**API calls failing**: Verify backend is running on 3001
**Styles not loading**: Clear browser cache and rebuild
**Token issues**: Check localStorage for access_token/refresh_token

## Performance Metrics

- Homepage: ~450ms (static prerendered)
- API Calls: ~80-120ms (cached after first)
- Build Time: ~60 seconds
- Bundle Size: ~87KB shared JS

## Next Steps for Enhancement

- Add WebSocket for real-time updates
- Implement dark/light mode toggle
- Add email verification on signup
- Setup analytics dashboard
- Create admin panel for user management
- Add payment integration for premium plans
