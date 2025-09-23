import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
        
        <div className="mb-6 text-slate-800">
          <p className="mb-2 text-lg">Something went wrong.</p>
          <p className="text-sm text-slate-500">
            {error?.statusText || error?.message || 'An unexpected error occurred'}
          </p>
          {error?.status && (
            <p className="mt-2 text-slate-400 text-sm">Status: {error.status}</p>
          )}
        </div>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Go to Home Page
          </Link>
          
          <Link
            to="/login"
            className="block w-full bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded hover:bg-slate-50 transition-colors"
          >
            Go to Login
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="block w-full bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded hover:bg-slate-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-500">
        Need help? Contact <a href="mailto:support@helamedhs.com" className="text-blue-600 hover:underline">support@helamedhs.com</a>
      </p>
    </div>
  );
};

export default ErrorPage;