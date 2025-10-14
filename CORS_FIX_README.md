# CORS Error Fix Documentation

## Problem
The registration form was failing with the following CORS error:
```
Access to fetch at 'http://localhost:5000/api/auth/register' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' 
when the request's credentials mode is 'include'.
```

## Root Cause
The frontend was sending requests with `credentials: 'include'` while the backend CORS was configured with a wildcard `*` origin. According to CORS specification, you cannot use wildcard origins when credentials are included in the request.

## Solution Implemented

### 1. Backend Changes (app.js)

**Before:**
```javascript
app.use(cors()); // Uses wildcard '*' by default
```

**After:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

### 2. Frontend Changes (Register.jsx)

**Before:**
```javascript
const response = await fetch(`${API_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
  credentials: 'include' // This was causing the CORS issue
});
```

**After:**
```javascript
const response = await fetch(`${API_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody)
  // credentials: 'include' removed - not needed for registration
  // Add it back only if you need to send cookies or use sessions
});
```

## Benefits of This Approach

1. **Security**: Specific origins are whitelisted instead of allowing all origins
2. **Flexibility**: Multiple development URLs are supported (localhost with different ports, 127.0.0.1)
3. **Production Ready**: Easy to add production URLs to the allowedOrigins array
4. **Credentials Support**: If you need to add credentials back later, the backend is now configured to support it

## When to Use `credentials: 'include'`

Add `credentials: 'include'` back to your fetch calls when you need to:
- Send cookies with the request
- Use HTTP authentication
- Send client certificates
- Use sessions for authentication

For JWT-based authentication (which this app uses), you typically don't need `credentials: 'include'` unless you're storing the JWT in an httpOnly cookie.

## Testing the Fix

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Try to register a new user with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Mobile Number: 1234567890
   - Password: test123
   - Confirm Password: test123

4. You should see a successful registration message

## Production Deployment

When deploying to production, update the `allowedOrigins` array in `backend/app.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Development
  'https://your-production-domain.com', // Production
  'https://www.your-production-domain.com' // Production with www
];
```

## Additional Notes

- The backend now properly handles preflight OPTIONS requests
- CORS headers are correctly set for all allowed origins
- The solution is compatible with both development and production environments
- No changes needed to other API endpoints - they'll all use the same CORS configuration

## Troubleshooting

If you still see CORS errors:

1. **Clear browser cache**: CORS headers can be cached
2. **Check browser console**: Look for the exact error message
3. **Verify backend is running**: Make sure the backend server restarted with new code
4. **Check the origin**: Ensure your frontend URL matches one in `allowedOrigins`
5. **Test with Postman**: CORS doesn't apply to non-browser requests, so this helps isolate the issue
