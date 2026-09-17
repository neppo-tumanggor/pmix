---
name: requirement
description: >-
  Menganalisis dan mendefinisikan kebutuhan menjadi requirements yang jelas,
  terukur, testable, dan tidak ambigu sebagai dasar design dan implementation.
disabled: true
---
-----------------------------------------------------------------------------------------------------------------------------------------------------------------

# Requirement

Definisikan apa yang harus dicapai system sebelum menentukan bagaimana solusi akan diimplementasikan.

Pisahkan kebutuhan dari implementation detail dan hindari asumsi yang tidak didukung oleh context, evidence, atau keputusan user.

## Usage

Gunakan skill ini ketika menerima feature request, perubahan behavior, business requirement, technical requirement, atau task yang membutuhkan klarifikasi scope dan expected behavior sebelum design atau implementation.

## Steps

1. Analisis objective, user needs, current behavior, constraints, dependencies, assumptions, stakeholders, dan context codebase yang relevan.
2. Definisikan functional requirements, non-functional requirements, scope, out-of-scope, acceptance criteria, edge cases, dan failure scenarios secara jelas serta testable.
3. Validasi requirements terhadap objective dan constraints, identifikasi ambiguity atau unresolved decision, dan pastikan requirements cukup lengkap untuk diteruskan ke design dan implementation.

## Required Output

Simpan hasil requirement di `.docs/requirements/` sebagai Markdown document yang minimal mencakup:

* objective dan problem statement
* scope dan out-of-scope
* assumptions dan constraints
* functional requirements
* non-functional requirements
* business rules jika relevan
* user atau system flows jika relevan
* edge cases dan failure scenarios
* dependencies dan integration requirements
* security dan privacy requirements jika relevan
* compatibility atau migration requirements jika relevan
* acceptance criteria
* open questions atau unresolved decisions

Setiap requirement harus spesifik, tidak ambigu, dan dapat diverifikasi melalui test, inspection, atau measurable acceptance criteria.

Requirement document menjadi source of truth untuk design dan implementation. Jika requirement berubah selama execution, perbarui document sebelum melanjutkan perubahan yang bergantung pada requirement tersebut.
