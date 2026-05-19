/**
 * Search History component - displays user's scan history
 */
import { useState, useEffect } from 'react';
import { HistoryService } from '../services/supabaseClient';

export default function SearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await HistoryService.getHistory(10);
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await HistoryService.deleteEntry(entryId);
      setHistory(history.filter((h) => h.id !== entryId));
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all search history?')) {
      return;
    }

    try {
      await HistoryService.clearHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Search History</h2>
        <div className="flex justify-center py-8">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Search History (Last 10)</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500">No search history yet.</p>
          <p className="text-gray-400 text-sm">Your scans will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
            >
              {/* Entry Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.search_query}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(entry.id)}
                className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
                title="Delete entry"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Showing last 10 searches. Older entries are automatically removed.</p>
      </div>
    </div>
  );
}
