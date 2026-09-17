---
name: dependency-management
description: >-
  Mengelola penambahan, update, replacement, dan removal dependency secara aman
  dengan mempertimbangkan compatibility, security, transitive dependencies,
  lockfile, build, dan runtime impact.
disabled: true
---
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Dependency Management

Kelola dependency dengan perubahan minimal dan gunakan package manager serta convention yang sudah digunakan project.

Hindari dependency baru jika functionality dapat dipenuhi secara wajar oleh existing dependency atau standard library.

## Usage

Gunakan skill ini ketika menambah, memperbarui, mengganti, menghapus, atau menganalisis package, library, framework, plugin, SDK, atau dependency lain dalam project.

## Steps

1. Analisis kebutuhan, existing dependencies, package manager, version constraints, compatibility, security risk, dan potential impact sebelum melakukan perubahan.
2. Terapkan perubahan dependency dengan scope minimal, gunakan versi yang kompatibel, dan pastikan manifest serta lockfile diperbarui secara konsisten.
3. Jalankan install, build, test, security validation, dan pemeriksaan dependency yang relevan untuk memastikan tidak terjadi regression atau compatibility issue.
