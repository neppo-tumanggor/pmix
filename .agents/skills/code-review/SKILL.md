---
name: code-review
description: >-
  Melakukan review terhadap perubahan code untuk memastikan correctness,
  maintainability, security, consistency, test coverage, dan risiko regression
  sebelum perubahan dianggap selesai.
disabled: true
---
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Code Review

Review perubahan code secara sistematis berdasarkan diff dan context codebase.

Fokus pada masalah yang berdampak nyata terhadap behavior, reliability, security, maintainability, dan compatibility. Hindari komentar style yang sudah dapat ditangani formatter atau linter.

## Usage

Gunakan skill ini setelah implementation, bug fix, refactoring, dependency change, atau perubahan code lain yang perlu divalidasi sebelum commit, Pull Request, merge, atau release.

## Steps

1. Analisis diff dan context code terkait untuk memahami intent perubahan serta area yang terdampak.
2. Review correctness, edge cases, error handling, security, architecture, maintainability, compatibility, dan test coverage; prioritaskan temuan berdasarkan severity.
3. Laporkan temuan yang actionable dengan lokasi dan alasan yang jelas, lalu pastikan issue critical atau high-impact diperbaiki sebelum perubahan dianggap selesai.
