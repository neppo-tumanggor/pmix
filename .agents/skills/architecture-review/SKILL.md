---
name: architecture-review
description: >-
  Mengevaluasi perubahan architecture untuk memastikan boundaries,
  responsibilities, dependencies, data flow, scalability, reliability, dan
  maintainability tetap konsisten dengan design system.
disabled: true
---
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Architecture Review

Review architecture berdasarkan existing system, requirements, constraints, dan impact perubahan terhadap component lain.

Prioritaskan simplicity, clear boundaries, low coupling, high cohesion, dan dependency direction yang terkontrol. Hindari abstraction atau complexity yang tidak memiliki kebutuhan nyata.

## Usage

Gunakan skill ini ketika perubahan melibatkan module boundaries, service boundaries, component interaction, shared abstraction, dependency direction, data flow, architectural pattern, atau keputusan design yang berdampak lintas component.

## Steps

1. Analisis current architecture, component responsibilities, boundaries, dependencies, interfaces, data flow, constraints, dan architectural conventions yang relevan.
2. Evaluasi proposed atau existing design terhadap coupling, cohesion, separation of concerns, dependency direction, scalability, reliability, maintainability, dan unnecessary complexity.
3. Identifikasi architectural risk dan trade-off, rekomendasikan perubahan dengan scope minimal, lalu verifikasi design tetap konsisten dengan requirements dan architecture system secara keseluruhan.

