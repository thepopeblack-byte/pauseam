# Actual production performance — 1 October 2026

Measurements came from the app's web-vitals 6.2.2 panel in the real deployed build,
not a generated score. See production-review.json for the tested commit, deployment,
conditions and every observed run. Results are snapshots, not a field percentile.

| Run | Viewport | LCP | INP | CLS |
|---|---|---|---|---|
| Desktop 1 | 1280 × 720 | 4,604 ms | 248 ms | 0.075 |
| Desktop 2 | 1280 × 720 | 3,436 ms | 352 ms | 0.090 |
| Mobile viewport before fix | 390 × 844 | 3,704 ms | 96 ms | 0.321 |

Targets were LCP <2,500 ms, INP <200 ms and CLS <0.1. The targets were not
consistently met. A response loading area was added after the observed mobile
layout shift; its actual deployed retest must be recorded separately.

These runs used the Windows host and in-app Chromium. No CPU or network throttling
was applied, network throughput was not measured, and caches were not cleared.
The desktop-2 tab did not apply an intended viewport override; its DOM size
confirmed desktop width and it is reported as desktop. The subsequent 390-pixel
run was confirmed before reloading. No horizontal overflow was observed.

This is responsive engineering evidence, not low-end Android or constrained-network
validation. Physical devices, characterised networks, repeated performance samples,
assistive technology and real model latency are still required. No ASR or text model
latency was measured because no approved model host is configured.
