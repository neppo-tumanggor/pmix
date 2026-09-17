# Debug

Debug masalah secara sistematis menggunakan evidence-driven root-cause analysis.

Gunakan workflow ini untuk bug, error, crash, failing test, incorrect output, integration failure, atau unexpected behavior.

## Workflow

1. Gunakan `debugging` untuk reproduce masalah, kumpulkan evidence, trace execution flow, bentuk hypothesis, dan identifikasi root cause.
2. Setelah root cause tervalidasi, gunakan `implementation` untuk membuat minimal fix. Gunakan `database`, `api-design`, `dependency-management`, `security-review`, `performance`, atau `architecture-review` hanya jika relevan terhadap root cause.
3. Gunakan `testing` untuk membuat atau memperbarui regression test dan menjalankan validation yang relevan.
4. Gunakan `code-review` untuk memastikan fix menyelesaikan root cause, tidak hanya menutupi symptom, dan tidak menyebabkan regression.
5. Gunakan `technical-writting` jika documented behavior, configuration, API, architecture, database, infrastructure, atau troubleshooting documentation terdampak.
6. Gunakan `git-workflow` hanya setelah fix dan seluruh validation selesai.

## Rules

* Jangan mengubah code sebelum memiliki evidence yang cukup terhadap penyebab masalah.
* Jangan memperbaiki symptom jika root cause masih dapat diidentifikasi.
* Jangan melakukan unrelated refactoring.
* Pertahankan scope fix sekecil mungkin.
* Regression test harus merepresentasikan failure scenario jika memungkinkan.
* Jika hypothesis tidak terbukti, kembali ke investigation dan bentuk hypothesis baru.
* Jika expected behavior ternyata berubah, hentikan bug-fix flow dan gunakan `requirement`.
* Jika root cause membutuhkan perubahan technical design, gunakan `design` dan `task` sebelum implementation.

## Completion

Debug selesai hanya jika:

* symptom tidak lagi terjadi
* root cause telah dipahami dan diperbaiki
* regression test atau validation relevan berhasil
* tidak ada known critical regression
* documentation yang terdampak telah sinkron
* final diff tidak mengandung unrelated changes
