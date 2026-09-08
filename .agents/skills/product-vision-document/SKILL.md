---
name: product-vision-document
description: >-
  Membuat Product Vision Document terstruktur untuk produk atau proyek baru
  berdasarkan template schema YAML.
disabled: true
---

# Product Vision Document

## Overview

Skill ini memandu AI agent untuk membuat **Product Vision Document** yang lengkap dan terstruktur. AI agent akan **membaca Market Development Docs terbaru** sebagai sumber konteks utama, mengumpulkan informasi produk dari user, mengisi template berdasarkan schema `product-vision/v1`, memvalidasi kelengkapan setiap section, dan menyimpan hasil sebagai dokumen Markdown yang siap dipakai.

## When to Use

Gunakan skill ini ketika:

- User meminta membuat atau menulis **product vision**, **visi produk**, atau **product vision document**
- Proyek baru membutuhkan dokumen visi awal sebagai fondasi strategis
- User ingin mendefinisikan arah strategis, misi, dan value proposition suatu produk
- User menyebut istilah terkait: *vision statement*, *problem statement*, *target users*, *value proposition*

## Prerequisites

**WAJIB — Aktivasi Clinerules Product Manager:**

Sebelum menjalankan skill ini, baca dan aktifkan `.clinerules/product.md`. Anda harus menjalankan peran sebagai **Top Global Product Manager** sepanjang workflow.

Aturan ketat:
- **DILARANG KERAS** menghasilkan output apapun (kode, dokumen, markdown, template, file) sebelum Gate Check lulus.
- Jika `.clinerules/product.md` belum dibaca, **JANGAN mulai workflow** — baca terlebih dahulu.
- Jika file `.clinerules/product.md` tidak ada atau kosong, hentikan dan keluarkan **PERINGATAN GATE CHECK** (lihat format di Workflow — Langkah 0), lalu berhenti total.
- Satu-satunya output yang boleh jika Gate Check gagal adalah **peringatan** yang sudah didefinisikan — tidak ada output lain.
- Semua keputusan produk harus mengikuti **Responsibilities**, **Product Principles**, dan **Constraints** dari `.clinerules/product.md`.
- Kreativitas dan inovasi harus lebih tinggi dari imitasi — sesuai prinsip Top Global Product Manager.

## Required Inputs

Kumpulkan informasi berikut dari user (atau dari brief yang sudah tersedia):

| Kategori | Informasi yang Diperlukan |
|---|---|
| **Sumber Referensi** | Market Development Docs terbaru dari `.docs/market-development-docs/` (wajib dibaca sebelum membuat dokumen) |
| **Dasar** | Nama produk, nama proyek, versi, status (Draft/Review/Approved), klasifikasi (Internal/Public), owner |
| **Strategis** | Vision statement (jangka panjang), mission, problem statement |
| **Pengguna** | Primary users, secondary users, enterprise users |
| **Prioritas** | Urutan prioritas pengguna, rollout strategy |
| **Nilai** | Overall value proposition, core value propositions, customer value, unique positioning |
| **Prinsip** | Product principles (minimal: yang relevan dari 12 prinsip default) |
| **Sukses** | User success, business success, engineering success, operational success, platform success, long-term success |

## Workflow

### Langkah 0 — GATE CHECK & Aktivasi Clinerules Product Manager

**GATE CHECK (WAJIB SEBELUM OUTPUT APAPUN)**

Sebelum melakukan apapun, jalankan Gate Check berikut:

1. Baca file `.clinerules/product.md`.
2. Periksa apakah file **ada** dan **tidak kosong**.

**Jika Gate Check GAGAL** (file tidak ada ATAU kosong ATAU belum dibaca):

Keluarkan **HANYA** peringatan berikut, lalu **BERHENTI TOTAL** — jangan lanjut ke langkah manapun:

```
⛔ GATE CHECK GAGAL — Workflow Dihentikan

⚠️  Clinerules Product Manager belum diaktifkan!

Skill 'product-vision-document' MEMBAWAH WAJIBKAN:
  • File '.clinerules/product.md' harus ada dan tidak kosong
  • Peran 'Top Global Product Manager' harus aktif

Tidak ada dokumen, kode, atau output apapun akan dibuat sampai prasyarat ini terpenuhi.

Silakan:
  1. Pastikan file '.clinerules/product.md' tersedia dan tidak kosong
  2. Aktifkan rule tersebut di sesi ini
  3. Jalankan ulang skill ini
```

**Jika Gate Check LOLOS** (file ada dan tidak kosong):

Baca dan aktivasi `.clinerules/product.md`. Pastikan Anda menjalankan peran sebagai **Top Global Product Manager**.

- Semua output harus konsisten dengan **Responsibilities**, **Product Principles**, dan **Constraints** yang didefinisikan di file tersebut.
- Lanjut ke Langkah 1.

### Langkah 1 — Baca Market Development Docs

Sebelum membuat Product Vision Document, baca dokumen Market Development terbaru dari:
```
.docs/market-development-docs/
```

Aturan pembacaan:
- Pilih file dengan **versi terbaru** (berdasarkan suffix `-v<version>` atau timestamp/file modification time terbaru).
- Jika ada beberapa file, gunakan yang versinya paling tinggi. Jika versi sama, pilih yang timestamp-nya paling baru.
- Gunakan isi Market Development Docs sebagai **konteks wajib** dan **sumber kebenaran** untuk mengisi semua section di Product Vision Document — termasuk problem statement, target users, value proposition, dan strategi.
- Jika folder `.docs/market-development-docs/` **kosong atau tidak ada**, tanyakan user via `ask_followup_question` apakah ada file market docs lain atau apakah perlu membuat tanpa referensi.

### Langkah 2 — Baca Template

Baca file template schema:
```
.agents/skills/product-vision-document/templates/product-vision-docs.yaml
```
Template ini adalah sumber kebenaran tunggal untuk struktur dan validasi dokumen.

### Langkah 3 — Kumpulkan Informasi

Kumpulkan semua input yang diperlukan dari user. Jika informasi kurang, tanyakan dengan spesifik — jangan mengisi dengan asumsi. Gunakan `ask_followup_question` bila perlu.

### Langkah 4 — Isi Template

Isi setiap field dan placeholder `{{...}}` dalam schema YAML dengan konten spesifik proyek. Pastikan setiap section mencakup semua `required_topics` yang tercantum.

### Langkah 5 — Validasi

Validasi hasil terhadap checklist berikut:

- [ ] Semua `{{placeholder}}` telah terisi (tidak ada yang tersisa)
- [ ] Semua `required_topics` di setiap section tercakup dalam isi
- [ ] Field `status` di-set ke salah satu: `Draft`, `Review`, atau `Approved`
- [ ] Tidak ada referensi ke produk asing — semua sudah diganti dengan produk user
- [ ] Struktur mengikuti urutan section di YAML

### Langkah 6 — Konversi ke Markdown

Konversi hasil dari format YAML ke Markdown yang rapi dan terbaca, mengikuti urutan section:

1. **Document Information** — Project, Document, Version, Status, Classification, Owner
2. **Vision Statement** — jelaskan purpose, strategic direction, future capabilities, engineering philosophy, long-term ambition
3. **Mission** — apa yang dibangun, untuk siapa, komitmen engineering
4. **Problem Statement** — masalah bisnis, masalah user, keterbatasan saat ini, mengapa produk ini ada
5. **Target Users** — primary, secondary, enterprise users
6. **User Prioritization** — urutan prioritas + rollout strategy
7. **Value Proposition** — overall, core value propositions, customer value, unique positioning
8. **Product Principles** — prinsip-prinsip produk yang relevan
9. **Success Vision** — user, business, engineering, operational, platform, long-term success
10. **Notes** — catatan tambahan

### Langkah 7 — Simpan Output

Simpan dokumen hasil ke:
```
.docs/product-development-docs/product-vision-docs-v<version>.md
```

Format penamaan file: `product-vision-docs-v<version>.md` (atau `product-vision-<project-slug>-v<version>.md` jika ada multiple proyek).

**Penting — Versioning & No Overwrite:**
- Setiap output adalah versi baru; **jangan menimpa** file yang sudah ada.
- Gunakan field `version` dari template (misal `1.0.0`) sebagai suffix nama file.
- Sebelum menyimpan, cek folder `.docs/product-development-docs/`. Jika file dengan versi tersebut sudah ada, increment versi atau tambahkan timestamp (misal `-v1.0.0-20260101`).
- Semua versi sebelumnya harus tetap tersimpan untuk keperluan history/audit.

## Output

- **Format:** Markdown (`.md`)
- **Lokasi:** `.docs/product-development-docs/`
- **Versioning:** Setiap file disimpan dengan suffix versi (`-v<version>`), tidak ada penimpaan file sebelumnya
- **Struktur:** Mengikuti urutan section di template YAML

## Quality Checklist

Sebelum menyimpan, pastikan:

- [ ] Semua placeholder `{{...}}` terisi dengan konten spesifik
- [ ] Setiap section mencakup `required_topics` yang tercantum di YAML
- [ ] `status` dokumen di-set (Draft/Review/Approved)
- [ ] `classification` di-set (Internal/Public)
- [ ] Tidak ada konten generik atau placeholder tersisa
- [ ] Bahasa konsisten (semua dalam Bahasa Indonesia atau Inggris sesuai preferensi user)
- [ ] Gate Check lulus sebelum output apapun dibuat (tidak ada kode/dokumen yang dihasilkan saat gate gagal)
- [ ] `.clinerules/product.md` telah dibaca dan peran Top Global Product Manager aktif selama workflow
- [ ] Product Vision Document dibuat berdasarkan dan konsisten dengan Market Development Docs terbaru
- [ ] Dokumen tersimpan di `.docs/product-development-docs/` dengan suffix versi yang benar (tidak menimpa versi sebelumnya)