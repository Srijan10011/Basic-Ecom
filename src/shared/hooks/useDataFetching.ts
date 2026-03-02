import React, { useState, useCallback, useEffect } from 'react';

export const useDataFetching = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  retryCount: number = 3,
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let lastError: any;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await fetchFunction();
        setData(result);
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `Data fetch failed (attempt ${attempt}/${retryCount}):`,
          err,
        );

        if (attempt < retryCount) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
          );
        }
      }
    }

    setError(lastError?.message || "Failed to fetch data");
  }, [fetchFunction, retryCount]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};
