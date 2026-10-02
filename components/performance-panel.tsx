"use client";
import { useEffect, useState } from "react";
type Vitals = { LCP?: number; INP?: number; CLS?: number };
export function PerformancePanel() {
  const [values, setValues] = useState<Vitals>({});
  useEffect(() => {
    let active = true;
    import("web-vitals").then(({ onLCP, onINP, onCLS }) => {
      const update = ({ name, value }: { name: string; value: number }) => {
        if (active) setValues((v) => ({ ...v, [name]: value }));
      };
      onLCP(update, { reportAllChanges: true });
      onINP(update, { reportAllChanges: true });
      onCLS(update, { reportAllChanges: true });
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <details className="performance-panel">
      <summary>This page’s performance</summary>
      <p>
        Live measurements in this browser only. Nothing is sent or saved.
        Interact with the page to measure INP; values may update until you
        leave.
      </p>
      <dl>
        <dt>LCP</dt>
        <dd>
          {values.LCP === undefined
            ? "Not measured"
            : Math.round(values.LCP) + " ms"}
        </dd>
        <dt>INP</dt>
        <dd>
          {values.INP === undefined
            ? "Not measured"
            : Math.round(values.INP) + " ms"}
        </dd>
        <dt>CLS</dt>
        <dd>
          {values.CLS === undefined ? "Not measured" : values.CLS.toFixed(3)}
        </dd>
      </dl>
      <p>
        These are page metrics, not model latency or representative mobile
        results. Record the actual device, network, build and test conditions
        before comparing.
      </p>
    </details>
  );
}
