import { useState, useEffect } from 'react';

export const useVisibilityRefetch = (
  refetchFn: () => void,
  shouldRefetch: boolean = true,
  dependencies: any[] = [],
) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isVisible;
      const isNowVisible = !document.hidden;
      setIsVisible(isNowVisible);

      if (!wasVisible && isNowVisible && shouldRefetch) {
        console.log("Tab became visible, re-fetching data...");
        refetchFn();
      }
    };

    const handleFocus = () => {
      if (shouldRefetch) {
        console.log("Window focused, re-fetching data...");
        refetchFn();
      }
    };

    const handleOnline = () => {
      if (shouldRefetch) {
        console.log("Network came online, re-fetching data...");
        refetchFn();
      }
    };

    setIsVisible(!document.hidden);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [refetchFn, shouldRefetch, isVisible, ...dependencies]);

  return { isVisible };
};
