---
name: design
description: >-
  Merancang solusi teknis sebelum implementation dengan mempertimbangkan
  requirements, architecture, interfaces, data flow, dependencies, trade-offs,
  risks, dan compatibility terhadap existing system.
disabled: true
---
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Design

Rancang solusi teknis berdasarkan requirement, constraints, existing architecture, dan evidence dari codebase sebelum perubahan diimplementasikan.

Prioritaskan design yang sederhana, konsisten, maintainable, dan memiliki trade-off yang jelas. Hindari overengineering dan speculative abstraction.

## Usage

Gunakan skill ini ketika task membutuhkan technical design, perubahan lintas component, interface baru, data flow baru, architectural decision, atau solusi yang perlu dirancang sebelum implementation.

## Steps

1. Analisis requirements, constraints, existing architecture, affected components, dependencies, data flow, interfaces, dan compatibility requirements.
2. Rancang solusi dengan scope minimal, tentukan component responsibilities, interfaces, data flow, failure handling, serta trade-off utama berdasarkan existing system.
3. Validasi design terhadap requirements, architecture, security, scalability, maintainability, dan implementation feasibility sebelum diteruskan ke implementation.

## Required Output

Simpan hasil design di `.docs/design/` sebagai Markdown document yang minimal mencakup:

* objective dan scope
* requirements dan constraints
* affected components
* proposed design
* interfaces atau contracts
* data flow
* data model atau schema changes jika relevan
* error dan failure handling
* security considerations jika relevan
* compatibility dan migration impact jika relevan
* alternatives dan trade-offs
* implementation plan
* risks dan validation strategy

Gunakan diagram Mermaid ketika component interaction, architecture, sequence, state transition, atau data flow lebih jelas direpresentasikan secara visual.

Design document wajib sinkron dengan final implementation. Jika implementation berubah dari design, perbarui design document sebelum task dianggap selesai.
