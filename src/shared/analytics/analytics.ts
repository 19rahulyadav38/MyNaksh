export type AnalyticsValue = string | number | boolean | null | string[];

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, AnalyticsValue>;
};

export type AnalyticsSink = (event: AnalyticsEvent) => void;

const devSink: AnalyticsSink = event => {
  if (__DEV__) {
    console.log('[analytics]', event.name, event.properties ?? {});
  }
};

const sinks = new Set<AnalyticsSink>([devSink]);

/**
 * Replace all sinks with one backend (CleverTap, Firebase, an ingestion
 * endpoint) at app start. Feature code only ever calls `track`.
 */
export function setAnalyticsSink(next: AnalyticsSink) {
  sinks.clear();
  sinks.add(next);
}

/** Adds a listener alongside existing sinks. Returns an unsubscribe function. */
export function addAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

export function track(event: AnalyticsEvent) {
  for (const sink of sinks) {
    try {
      sink(event);
    } catch (error) {
      // Analytics must never break the product, or the other sinks.
      if (__DEV__) {
        console.warn('[analytics] sink failed', error);
      }
    }
  }
}
