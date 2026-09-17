---
name: git-workflow
description: >-
  Gunakan skill ini untuk workflow Git seperti commit, branch, merge, rebase,
  pull, push, conflict resolution, cherry-pick, revert, tag, release, dan Pull
  Request.
---
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Git Workflow

Jalankan operasi Git secara aman, terstruktur, dan sesuai standard repository.

Gunakan `docs/git-standard-2026.md` sebagai referensi utama untuk aturan dan best practices Git.

## Usage

Gunakan skill ini ketika user meminta:

* commit perubahan
* membuat atau mengelola branch
* merge atau rebase
* pull, fetch, atau push
* menyelesaikan merge conflict
* cherry-pick atau revert
* membuat tag atau release
* menyiapkan Pull Request
* menganalisis Git history
* memperbaiki masalah Git

## Steps

1. Periksa kondisi repository dengan `git status`, branch aktif, diff, dan staged changes.
2. Pahami tujuan user dan convention Git yang digunakan repository.
3. Baca `docs/git-standard-2026.md` jika task membutuhkan keputusan workflow atau operasi berisiko.
4. Jalankan operasi Git paling aman dan hindari perubahan yang tidak berkaitan dengan task.
5. Verifikasi hasil dengan `git status`, diff, log, dan validation yang relevan.
6. Laporkan branch, operasi, commit, validation, dan kondisi akhir repository.
