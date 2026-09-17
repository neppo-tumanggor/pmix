---
name: debugging
description: >-
  Menganalisis dan memperbaiki bug, error, failing test, crash, atau unexpected
  behavior menggunakan evidence-driven root-cause analysis.
disabled: true
---
-------------------------------------------------------------------------------------------------------------------------------------------------

# Debugging

Lakukan debugging secara sistematis berdasarkan evidence. Identifikasi root cause sebelum mengubah code dan hindari trial-and-error fix tanpa pemahaman yang jelas.

Perbaikan harus menyelesaikan penyebab utama tanpa menimbulkan regression atau perubahan behavior yang tidak diperlukan.

## Usage

Gunakan skill ini ketika terjadi bug, error, exception, crash, failing test, incorrect output, unexpected behavior, integration failure, atau masalah lain yang membutuhkan root-cause analysis.

## Steps

1. Reproduce masalah dan kumpulkan evidence dari error, logs, stack trace, test, input, configuration, serta execution flow yang relevan.
2. Trace masalah hingga menemukan root cause, validasi hypothesis terhadap codebase, lalu implementasikan minimal fix yang menyelesaikan penyebab utama.
3. Buat atau perbarui regression test, jalankan validation yang relevan, dan pastikan masalah telah diperbaiki tanpa menyebabkan regression.
