---
name: technical-writting
description: >-
  Memelihara dokumentasi teknis project di folder `.docs/` agar selalu akurat
  dan sinkron dengan implementasi terbaru. Gunakan setelah perubahan codebase
  yang memengaruhi behavior, architecture, API, data model, configuration,
  infrastructure, dependency, atau developer workflow.
---
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Technical Writting

Pastikan dokumentasi di folder `.docs/` selalu merepresentasikan kondisi aktual system dan dapat digunakan sebagai technical source of truth project.

Dokumentasi harus akurat, ringkas, konsisten, mudah dipahami, dan berdasarkan implementation aktual. Jangan mendokumentasikan behavior, API, configuration, atau architecture yang tidak dapat diverifikasi dari codebase.

## Usage

Gunakan skill ini ketika:

* feature ditambahkan, diubah, atau dihapus
* application behavior atau business logic berubah
* API, interface, contract, atau integration berubah
* architecture, component, module, atau data flow berubah
* database schema atau data model berubah
* configuration atau environment variable berubah
* infrastructure, deployment, atau CI/CD berubah
* dependency penting berubah
* development, build, testing, atau operational workflow berubah
* dokumentasi tidak lagi sesuai dengan implementation

## Steps

1. Analisis perubahan codebase dan identifikasi dokumentasi yang terdampak.
2. Periksa existing documentation di folder `.docs/` sebelum membuat document baru.
3. Perbarui existing document jika topik sudah tersedia dan hindari duplicate documentation.
4. Buat document baru hanya jika belum tersedia lokasi dokumentasi yang sesuai.
5. Dokumentasikan current state berdasarkan implementation aktual, bukan asumsi atau planned behavior.
6. Verifikasi terminology, file path, command, API, configuration, code example, dan reference terhadap codebase.
7. Perbarui atau hapus informasi obsolete, contradictory, atau tidak relevan.
8. Pertahankan structure, naming, dan writing style yang konsisten.
9. Pastikan folder `.docs/` sinkron dengan kondisi aktual system sebelum task dinyatakan selesai.
