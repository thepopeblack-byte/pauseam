# Actual production performance — 1 October 2026

Measurements came from the app's web-vitals 6.2.2 panel in the real deployed build,
not a generated score. See production-review.json for the tested commit, deployment,
conditions and every observed run. Results are snapshots, not a field percentile.

| Run | Viewport | LCP | INP | CLS |
|---|---|---|---|---|
| Desktop 1 | 1280 × 720 | 4,604 ms | 248 ms | 0.075 |
| Desktop 2 | 1280 × 720 | 3,436 ms | 352 ms | 0.090 |
| Mobile viewport before fix | 390 × 844 | 3,704 ms | 96 ms | 0.321 |
| Mobile viewport after fix | 390 × 844 | 5,852 ms | 120 ms | 0.023 |

Targets were LCP <2,500 ms, INP <200 ms and CLS <0.1. The targets were not
consistently met. A response loading area was added after the observed mobile
layout shift; the deployed retest reduced the observed CLS to 0.023. INP was 120 ms, but LCP was 5,852 ms and still failed. This single-run comparison does not establish a field improvement. Fresh-clone verification had been launched concurrently; its completion state was not checked before measurement, so CPU contention was not controlled.

These runs used the Windows host and in-app Chromium. No CPU or network throttling
was applied, network throughput was not measured, and caches were not cleared.
The desktop-2 tab did not apply an intended viewport override; its DOM size
confirmed desktop width and it is reported as desktop. The subsequent 390-pixel
run was confirmed before reloading. No horizontal overflow was observed.

This is responsive engineering evidence, not low-end Android or constrained-network
validation. Physical devices, characterised networks, repeated performance samples,
assistive technology and real model latency are still required. No ASR or text model
latency was measured because no approved model host is configured.

## 2 October 2026 WAT — asset reduction and warm reload

Release 007a56ce4a58ba76540fa87ae101177d19acc066 reduced CSS from 129,019 to 15,924 bytes and shared voice/consent JavaScript from 55,055 to 12,041 bytes. TypeScript, production build, consent/guidance checks and 15 public HTTP checks passed. A single 390 × 844 Windows/in-app Chromium warm reload measured LCP 332 ms, INP 56 ms and CLS 0.000; document/scroll width 375 px. Caches were not cleared, CPU/network not throttled, throughput unmeasured. This is not field or physical Android validation and does not erase earlier failures. Evidence: bundle-improvement-2026-10-02.json and production-performance-2026-10-02.jpg.
