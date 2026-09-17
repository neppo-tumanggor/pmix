# Spec-Driven Engineering

Gunakan spec sebagai source of truth sebelum implementation.

Untuk perubahan feature, behavior, API, architecture, database, integration, atau system capability yang non-trivial, jalankan workflow:

`requirement → design → task → implementation → validation`

Jangan melompati tahap sebelumnya jika keputusan pada tahap tersebut belum cukup jelas untuk mendukung tahap berikutnya.

## Requirement

Gunakan `requirement` untuk menentukan **apa yang harus dibangun**.

Requirement harus mendefinisikan objective, scope, constraints, expected behavior, acceptance criteria, edge cases, failure scenarios, dan relevant non-functional requirements.

Requirement tidak boleh bergantung pada implementation detail kecuali terdapat technical constraint yang memang wajib.

Selesaikan ambiguity yang dapat mengubah scope, behavior, contract, data model, security, atau acceptance criteria sebelum design dianggap final.

## Design

Setelah requirement cukup stabil, gunakan `design` untuk menentukan **bagaimana requirement akan direalisasikan**.

Design harus berdasarkan requirement dan existing codebase.

Tentukan affected components, responsibilities, interfaces, contracts, data flow, dependencies, persistence changes, failure handling, compatibility impact, security considerations, trade-offs, dan validation strategy yang relevan.

Jangan mengubah requirement secara diam-diam untuk menyesuaikan design.

Jika design menemukan requirement yang incomplete, contradictory, atau infeasible:

`design → requirement → design`

Perbarui requirement terlebih dahulu sebelum melanjutkan.

## Task

Setelah design tervalidasi, gunakan `task` untuk mengubah spec menjadi **execution plan yang konkret**.

Task harus diturunkan dari requirement dan design, bukan dibuat langsung berdasarkan asumsi implementation.

Setiap task harus:

* memiliki objective yang jelas
* memiliki scope terbatas
* dapat dieksekusi dan diverifikasi
* memiliki dependency yang jelas jika ada
* mengacu pada acceptance criteria atau design decision yang relevan
* menghindari unrelated changes
* dapat diarahkan ke skill engineering yang sesuai

Urutkan task berdasarkan dependency teknis dan risiko.

Foundation, contract, schema, atau dependency yang dibutuhkan task lain harus dikerjakan sebelum consumer-nya.

## Traceability

Pertahankan traceability:

`Requirement → Design Decision → Task → Implementation → Test`

Setiap perubahan implementation harus dapat ditelusuri ke requirement atau design decision yang relevan.

Jangan menambahkan behavior baru yang tidak memiliki dasar requirement.

Jangan membuat architectural abstraction yang tidak memiliki dasar design atau kebutuhan implementation yang terbukti.

Setiap acceptance criteria harus memiliki validation yang relevan sebelum task dianggap selesai.

## Change Control

Jika requirement berubah:

`requirement → design review → task review → implementation`

Evaluasi ulang design dan task yang terdampak sebelum meneruskan execution.

Jika design berubah tanpa perubahan requirement:

`design → task review → implementation`

Perbarui task yang terdampak sebelum execution.

Jika implementation menemukan constraint baru yang memengaruhi spec:

`implementation → design`

atau:

`implementation → requirement`

berdasarkan level keputusan yang terdampak.

Jangan menyelesaikan spec drift hanya dengan menyesuaikan code.

## Engineering Execution

Setelah task siap, gunakan engineering orchestration untuk execution.

Default flow:

`task → codebase-analysis → implementation → testing → code-review`

Gunakan skill tambahan berdasarkan affected area dan risk:

* `architecture-review`
* `api-design`
* `database`
* `dependency-management`
* `security-review`
* `performance`
* `observability`
* `debugging`
* `refactoring`

Setelah implementation dan validation:

`technical-writting → git-workflow`

Gunakan `release` hanya ketika perubahan masuk ke release workflow.

## Completion Gates

Spec-driven task belum selesai sampai:

1. Requirement masih merepresentasikan expected behavior final.
2. Design masih merepresentasikan implementation final dan relevant decisions.
3. Task yang direncanakan telah selesai atau secara eksplisit dinyatakan tidak diperlukan.
4. Implementation memenuhi acceptance criteria.
5. Relevant tests dan quality gates berhasil.
6. Tidak terdapat unresolved critical correctness, security, data integrity, atau compatibility issue.
7. Dokumentasi teknis yang terdampak tetap sinkron dengan implementation.
8. Final diff tetap berada dalam scope requirement dan design.

Jika code, requirement, design, dan task tidak lagi konsisten, task belum selesai.
