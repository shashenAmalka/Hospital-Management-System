# Axios Installation Guide

## Problem
The application is showing the error: **"Failed to resolve import 'axios' from 'src/utils/apiService.js'"**

This occurs because the `axios` package is not installed in the frontend dependencies.

## Solution

### Step 1: Navigate to Frontend Directory
```powershell
cd d:\itp\Hospital-Management-System\frontend
```

### Step 2: Install Axios
Run one of the following commands based on your package manager:

#### Using NPM (Recommended for this project)
```powershell
npm install axios
```

#### Using Yarn (Alternative)
```powershell
yarn add axios
```

#### Using PNPM (Alternative)
```powershell
pnpm add axios
```

### Step 3: Verify Installation
After installation, verify that axios has been added to your `package.json`:

```json
{
  "dependencies": {
    // ... other dependencies
    "axios": "^1.x.x"  // Version may vary
  }
}
```

### Step 4: Restart Development Server
After installing axios, restart your development server:

```powershell
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Quick Installation (Copy and Paste)

Open a new PowerShell terminal and run these commands:

```powershell
cd d:\itp\Hospital-Management-System\frontend
npm install axios
npm run dev
```

## Files That Use Axios

The following files in your project import and use axios:

1. `frontend/src/utils/apiService.js` - Main API service utility
2. `frontend/src/utils/requests.js` - Request interceptor utility
3. `frontend/src/utils/api.js` - API helper functions

## Expected Result

After successful installation:
- ✅ Axios will be added to `frontend/package.json`
- ✅ The import error will be resolved
- ✅ Your API service will work correctly
- ✅ Authentication and API calls will function properly

## Troubleshooting

### If installation fails:

1. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```powershell
   cd d:\itp\Hospital-Management-System\frontend
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm install
   npm install axios
   ```

3. **Check npm version:**
   ```powershell
   npm --version
   ```
   If version is too old, update npm:
   ```powershell
   npm install -g npm@latest
   ```

### If the error persists after installation:

1. **Restart VS Code** - Sometimes the TypeScript/ESLint server needs a restart
2. **Check the import statement** in `apiService.js`:
   ```javascript
   import axios from 'axios';  // Should be this format
   ```

3. **Verify node_modules** exists:
   ```powershell
   Test-Path d:\itp\Hospital-Management-System\frontend\node_modules\axios
   ```

## Next Steps After Installation

Once axios is installed:

1. The API service utility will be functional
2. Authentication will work properly
3. All API calls in components will execute correctly
4. The application should run without import errors

## Additional Notes

- Axios is a popular HTTP client library for making API requests
- It's used in this project for handling authentication tokens automatically
- Version ~1.6.0 or higher is recommended
- The package size is approximately 5-6 MB

## Support

If you continue to experience issues after following these steps, check:
- Node.js version (should be 16.x or higher)
- NPM version (should be 8.x or higher)
- Internet connection (for downloading packages)
- Firewall settings (may block npm downloads)
