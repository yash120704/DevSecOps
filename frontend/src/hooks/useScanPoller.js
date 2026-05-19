import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useScanPoller(scanId, intervalMs = 2000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(scanId));

  useEffect(() => {
    if (!scanId) {
      return undefined;
    }

    let active = true;
    let timer = null;

    const tick = async () => {
      try {
        const response = await api.get(`/scan-status/${scanId}/`);
        if (!active) {
          return;
        }
        setData(response.data);
        setError('');
        setLoading(false);

        if (!['completed', 'failed'].includes(response.data?.scan_status || response.data?.status)) {
          timer = setTimeout(tick, intervalMs);
        }
      } catch (err) {
        if (!active) {
          return;
        }
        setLoading(false);
        setError(err.response?.data?.error || err.message || 'Polling failed');
        timer = setTimeout(tick, intervalMs);
      }
    };

    tick();

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [scanId, intervalMs]);

  return { data, error, loading };
}
