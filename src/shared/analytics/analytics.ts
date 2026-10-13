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

let sink: AnalyticsSink = devSink;

/**
 * Swap in a real backend (CleverTap, Firebase, an ingestion endpoint) at app
 * start. Feature code only ever calls `track`, so it never changes.
 */
export function setAnalyticsSink(next: AnalyticsSink) {
  sink = next;
}

export function track(event: AnalyticsEvent) {
  try {
    sink(event);
  } catch (error) {
    // Analytics must never break the product.
    if (__DEV__) {
      console.warn('[analytics] sink failed', error);
    }
  }
}
