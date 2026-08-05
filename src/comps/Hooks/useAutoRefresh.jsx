import { useEffect } from "react";

const POLL_INTERVAL = 60 * 1000; // check every 60 seconds

export function useAutoRefresh() {
  useEffect(() => {
    // Capture the version that was live when this tab loaded
    let currentVersion = null;

    const fetchVersion = async () => {
      try {
        const res = await fetch(
          `/version.json?t=${Date.now()}`, // cache-bust
          { cache: "no-store" },
        );
        const data = await res.json();

        if (!currentVersion) {
          // First fetch — store baseline
          currentVersion = data.version;
          return;
        }

        if (data.version !== currentVersion) {
          // New deployment detected — reload!
          window.location.reload();
        }
      } catch {
        // Network hiccup — silently ignore, try again next interval
      }
    };

    fetchVersion(); // run immediately on mount
    const interval = setInterval(fetchVersion, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);
}
