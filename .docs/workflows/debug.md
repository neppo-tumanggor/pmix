# Debug

## Dashboard menampilkan HTTP 401

Endpoint dashboard memerlukan JWT. Client di `apps/frontend/src/lib/api/auth.ts` mencoba refresh satu kali ketika request terproteksi menerima 401. Jika refresh token tidak tersedia atau refresh gagal, state autentikasi dibersihkan dan browser diarahkan ke `/login`. Respons 401 dari login dan refresh tidak memicu refresh otomatis.

Token hasil refresh diperbarui melalui Zustand agar state aplikasi dan `auth-storage` tetap sinkron. Regression test tersedia di `apps/frontend/src/lib/api/auth.test.ts`; jalankan dari `apps/frontend` dengan `pnpm exec vitest run src/lib/api/auth.test.ts`.

## Produk kosong atau gagal dimuat

`GET /products` tanpa parameter `page` dimulai dari halaman 1, dengan jumlah item mengikuti `PRODUCT_PAGE_SIZE` (default 20). Halaman produk menampilkan status HTTP ketika request gagal, atau pesan koneksi jika respons tidak diterima, beserta tombol coba lagi. Pesan daftar kosong hanya tampil setelah request berhasil tanpa produk.

Root layout memakai `suppressHydrationWarning` pada `<body>` untuk menoleransi atribut yang disisipkan ekstensi browser sebelum hidrasi, seperti `cz-shortcut-listen`. Ini hanya membatasi peringatan pada elemen tersebut dan tidak memperbaiki kegagalan API.

Untuk HTTP 404, periksa URL dan metode request. Base URL pengembangan adalah `http://localhost:1457/api/v1`; `/products` tanpa prefix API tidak terdaftar di backend. Penyimpanan edit dari daftar maupun detail produk menggunakan `PATCH /products/:id`. `PATCH /products/` tanpa ID dan `PUT /products/:id` tidak terdaftar. HTTP 404 pada `GET /products/:id` juga dapat berarti produk tidak ditemukan untuk tenant sesi tersebut.

Halaman detail mengambil ID dari `useParams` milik Next.js agar mengikuti route aktif saat navigasi client, bukan membaca `window.location` saat render. Kegagalan request detail ditampilkan di halaman dengan opsi mencoba lagi atau kembali ke daftar; respons 404 tidak langsung mengalihkan halaman.

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
