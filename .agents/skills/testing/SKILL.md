---
name: testing
description: >-
  Membuat, memperbarui, dan menjalankan test untuk memastikan perubahan code
  bekerja sesuai expected behavior serta mencegah regression.
---
------------------------------------------------------------------------------------------------------------------------------------------------

# Testing

Pastikan setiap perubahan code memiliki validation dan test coverage yang sesuai dengan risiko serta behavior yang berubah.

Gunakan existing testing framework, convention, dan command yang sudah digunakan oleh project.

## Usage

Gunakan skill ini ketika feature ditambahkan atau diubah, bug diperbaiki, behavior berubah, refactoring dilakukan, atau perubahan code membutuhkan validation sebelum dianggap selesai.

## Steps

1. Analisis perubahan code, expected behavior, edge cases, failure scenarios, dan existing tests yang relevan.
2. Buat atau perbarui test yang diperlukan menggunakan testing pattern project, lalu jalankan test paling relevan terlebih dahulu sebelum menjalankan test suite yang lebih luas.
3. Perbaiki failure yang disebabkan perubahan, verifikasi tidak terjadi regression, dan pastikan seluruh test relevan berhasil sebelum task dianggap selesai.
