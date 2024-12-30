'use client';
import React, { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [detailLevel, setDetailLevel] = useState('medium');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const explainCode = async () => {
    setLoading(true);
    setError('');
    setExplanation('');

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, detailLevel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get explanation');
      }

      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <h1 className="text-6xl font-bold mb-8 text-center">Code Explainer</h1>
        
        <div className="space-y-4">
          <textarea
            className="w-full h-72 p-4 text-sm font-mono bg-white border rounded-lg shadow-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            aria-label="Code input"
          />
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium" htmlFor="detail-level">
              Explanation Detail:
            </label>
            <select 
              id="detail-level"
              value={detailLevel} 
              onChange={(e) => setDetailLevel(e.target.value)} 
              className="w-32 p-2 rounded-lg border"
            >
              <option value="brief">Brief</option>
              <option value="medium">Medium</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          <button 
            onClick={explainCode} 
            disabled={!code || loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 
                     hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Explanation...
              </>
            ) : (
              'Explain Code'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {explanation && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Explanation:</h2>
            <div className="whitespace-pre-wrap prose max-w-none">{explanation}</div>
          </div>
        )}
      </div>
    </main>
  );
}