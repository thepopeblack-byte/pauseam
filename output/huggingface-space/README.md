---
title: PauseAm model service
emoji: 🎙️
colorFrom: green
colorTo: gray
sdk: docker
app_port: 7860
suggested_hardware: cpu-upgrade
startup_duration_timeout: 1h
models:
- NCAIR1/N-ATLaS
- NCAIR1/NigerianAccentedEnglish
- NCAIR1/Yoruba-ASR
- NCAIR1/Hausa-ASR
- NCAIR1/Igbo-ASR
---

# PauseAm private inference gateway

This is a team-hosted model service using official pinned NCAIR weights. It is
not proof of the official N-ATLaS API or organiser approval of self-hosted ASR.
The public product is https://pauseam.theblockcapitol.com.

The suggested hardware field does not purchase or select hardware. Select CPU
Upgrade (8 vCPU / 32 GB) explicitly after reviewing the account's live price.
Only authorised requests can transcribe or generate. Model files are verified;
real speech, latency, correctness and fluent wording still require validation.
