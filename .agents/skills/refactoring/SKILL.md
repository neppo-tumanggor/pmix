---
name: refactoring
description: >-
  Memperbaiki struktur internal code untuk meningkatkan readability,
  maintainability, modularity, dan design tanpa mengubah observable behavior
  atau memperluas scope perubahan secara tidak diperlukan.
disabled: true
---
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Refactoring

Lakukan refactoring secara incremental dengan mempertahankan existing behavior dan public contract.

Prioritaskan perubahan kecil, terukur, dan mudah diverifikasi. Hindari rewrite atau perubahan architecture yang tidak diperlukan oleh tujuan refactoring.

## Usage

Gunakan skill ini ketika code perlu disederhanakan, duplicate logic dihilangkan, responsibility dipisahkan, naming diperbaiki, complexity dikurangi, module diekstrak, atau internal structure diperbaiki tanpa mengubah expected behavior.

## Steps

1. Analisis existing behavior, tests, dependencies, public contract, dan code smell yang menjadi target refactoring.
2. Lakukan perubahan secara incremental dengan scope minimal, mengikuti existing architecture dan convention serta mempertahankan observable behavior.
3. Jalankan relevant tests dan validation, bandingkan behavior sebelum dan sesudah perubahan, lalu pastikan refactoring tidak menyebabkan regression atau unintended API/contract changes.
