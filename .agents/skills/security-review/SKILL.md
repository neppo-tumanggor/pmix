---
name: security-review
description: >-
  Melakukan security review terhadap perubahan code untuk mengidentifikasi
  vulnerability, insecure behavior, authorization flaw, data exposure, secret
  leakage, injection, dan security regression sebelum perubahan dianggap
  selesai.
disabled: true
---
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Security Review

Review perubahan code berdasarkan attack surface, trust boundary, data flow, dan security impact terhadap system.

Prioritaskan vulnerability yang dapat dieksploitasi dan hindari temuan spekulatif tanpa evidence dari codebase.

## Usage

Gunakan skill ini ketika perubahan melibatkan authentication, authorization, API, user input, sensitive data, database, file handling, secrets, dependency, external integration, infrastructure, atau security-sensitive behavior.

## Steps

1. Analisis perubahan, attack surface, trust boundary, sensitive data flow, permissions, dan security assumptions yang terdampak.
2. Review authentication, authorization, input validation, injection, data exposure, secrets, cryptography, dependency risk, error handling, dan relevant security controls; klasifikasikan temuan berdasarkan severity dan exploitability.
3. Perbaiki vulnerability yang relevan, tambahkan security/regression test jika diperlukan, jalankan validation, dan pastikan tidak ada critical atau high-risk finding yang belum ditangani sebelum task selesai.
