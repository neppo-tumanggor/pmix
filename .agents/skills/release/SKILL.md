---
name: release
description: >-
  Menyiapkan dan memvalidasi software release secara aman dengan memastikan
  versioning, changelog, build, tests, migration, artifacts, tags, dan release
  readiness konsisten dengan convention project.
disabled: true
---
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Release

Lakukan release berdasarkan existing release process, versioning strategy, CI/CD pipeline, dan convention yang digunakan project.

Prioritaskan reproducibility, traceability, backward compatibility, dan validation sebelum release dipublikasikan.

## Usage

Gunakan skill ini ketika menyiapkan version bump, changelog, release notes, release candidate, production release, Git tag, build artifact, atau validation sebelum deployment.

## Steps

1. Analisis perubahan sejak release sebelumnya, versioning, breaking changes, migrations, dependencies, configuration, dan release requirements yang relevan.
2. Siapkan version, changelog atau release notes, artifacts, dan Git tag sesuai convention project tanpa melewati required validation atau CI/CD process.
3. Jalankan build, tests, migration dan release checks yang relevan, verifikasi artifacts serta release metadata, dan pastikan release siap dipublikasikan tanpa known critical issue.
