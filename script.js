"use strict";

// ==================== FUNGSI DASAR ====================

const $ = (selector, root = document) => {
    return root.querySelector(selector);
};

const $$ = (selector, root = document) => {
    return [...root.querySelectorAll(selector)];
};

function esc(value) {
    const karakter = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value ?? "").replace(
        /[&<>"']/g,
        huruf => karakter[huruf]
    );
}

function money(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);
}

function price(book) {
    return Number(String(book.harga).replace(/\D/g, ""));
}

const key = "ruangbaca-salin-v1-";

function read(name, fallback) {
    try {
        const value = localStorage.getItem(key + name);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function write(name, value) {
    try {
        localStorage.setItem(key + name, JSON.stringify(value));
        return true;
    } catch {
        toast("Penyimpanan browser tidak tersedia.");
        return false;
    }
}

let books = read(
    "books",
    JSON.parse(JSON.stringify(dataKatalogBuku))
);

let users = read("users", []);
let cart = read("cart", []);
let orders = read("orders", []);

let user = null;

try {
    user = JSON.parse(
        sessionStorage.getItem(key + "session") || "null"
    );
} catch {
    user = null;
}

const page = document.body.dataset.page;
const modal = $("#modal");

let toastTimer;

function toast(message) {
    const node = $("#toast");

    node.textContent = message;
    node.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        node.classList.remove("show");
    }, 4000);
}

function showModal(html) {
    $("#modal-content").innerHTML = `
    <button
      type="button"
      class="modal-close"
      aria-label="Tutup modal"
    >
      ×
    </button>
    ${html}
  `;

    $(".modal-close").addEventListener("click", () => {
        modal.close();
    });

    modal.showModal();
}

modal.addEventListener("click", event => {
    if (event.target !== modal) return;

    const batas = modal.getBoundingClientRect();

    const diLuar =
        event.clientX < batas.left ||
        event.clientX > batas.right ||
        event.clientY < batas.top ||
        event.clientY > batas.bottom;

    if (diLuar) modal.close();
});

function cover(book) {
    const path = String(book.cover);

    if (!path.startsWith("img/")) {
        return "img/pengantar_komunikasi.jpg";
    }

    // Menyesuaikan gambar PAUD yang kamu kirim dalam format .jpg.
    return esc(
        path.replace(
            "paud_perkembangan.jpeg",
            "paud_perkembangan.jpg"
        )
    );
}

function empty(
    title,
    body,
    link = "stok.html",
    label = "Jelajahi katalog →"
) {
    return `
    <div class="empty">
      <h3>${esc(title)}</h3>
      <p>${esc(body)}</p>
      <a class="button secondary" href="${esc(link)}">
        ${esc(label)}
      </a>
    </div>
  `;
}

function stat(value, label, symbol) {
    return `
    <article class="stat">
      <span class="stat-icon" aria-hidden="true">
        ${symbol}
      </span>
      <div>
        <b>${esc(value)}</b>
        <small>${esc(label)}</small>
      </div>
    </article>
  `;
}

// ==================== KERANJANG ====================

function updateBadges() {
    const total = cart.reduce(
        (jumlah, item) => jumlah + item.qty,
        0
    );

    $$("[data-cart-count]").forEach(node => {
        node.textContent = total;
    });
}

function saveCart() {
    write("cart", cart);
    updateBadges();
}

function cartDetails() {
    return cart
        .map(item => ({
            ...item,
            book: books.find(book => book.kodeBarang === item.code)
        }))
        .filter(item => item.book);
}

function addToCart(code) {
    const book = books.find(book => book.kodeBarang === code);

    if (!book) return;

    const current = cart.find(item => item.code === code);
    const jumlah = current ? current.qty : 0;

    if (jumlah >= book.stok) {
        toast("Jumlah pesanan sudah mencapai stok tersedia.");
        return;
    }

    if (current) {
        current.qty++;
    } else {
        cart.push({
            code: code,
            qty: 1
        });
    }

    saveCart();
    toast("Buku ditambahkan ke keranjang.");
}

function bookCard(book) {
    return `
    <article class="book-card">
      <div class="cover-wrap">
        <span class="edition">
          EDISI ${esc(book.edisi)}
        </span>

        <img
          src="${cover(book)}"
          alt="Sampul ${esc(book.namaBarang)}"
          loading="lazy"
        >
      </div>

      <div class="book-meta">
        <small>${esc(book.kodeBarang)}</small>

        <h3>${esc(book.namaBarang)}</h3>

        <div class="book-bottom">
          <span class="price">${money(price(book))}</span>

          <button
            class="add-cart"
            data-add="${esc(book.kodeBarang)}"
            aria-label="Tambah ${esc(book.namaBarang)} ke keranjang"
            ${book.stok < 1 ? "disabled" : ""}
          >
            +
          </button>
        </div>

        <div class="stock-label">
          ${book.stok > 0
            ? "● " + esc(book.stok) + " buku tersedia"
            : "Stok habis"
        }
        </div>
      </div>
    </article>
  `;
}

function bindAdd(root = document) {
    $$("[data-add]", root).forEach(button => {
        button.addEventListener("click", () => {
            addToCart(button.dataset.add);
        });
    });
}

// ==================== MENJALANKAN HALAMAN ====================

if (page === "login") {
    setupLogin();
} else if (!user) {
    location.replace("login.html");
} else {
    $("#user-name").textContent = user.nama;
    $("#avatar").textContent = user.nama.charAt(0).toUpperCase();

    $("#user-role").textContent =
        user.role === "Admin"
            ? "Admin Ruang Baca"
            : "Anggota Ruang Baca";

    $("#year").textContent = new Date().getFullYear();

    updateBadges();

    $("#logout").addEventListener("click", () => {
        try {
            sessionStorage.removeItem(key + "session");
        } catch {
            // Tetap kembali ke login jika browser membatasi penyimpanan.
        }

        location.href = "login.html";
    });

    $("#mobile-menu").addEventListener("click", () => {
        const terbuka = $(".sidebar").classList.toggle("open");

        $("#mobile-menu").setAttribute(
            "aria-expanded",
            String(terbuka)
        );
    });

    document.addEventListener("click", event => {
        if (
            !event.target.closest(".sidebar") &&
            !event.target.closest("#mobile-menu")
        ) {
            $(".sidebar").classList.remove("open");
            $("#mobile-menu").setAttribute("aria-expanded", "false");
        }
    });

    if (page === "dashboard") setupDashboard();
    if (page === "stok") setupCatalog();
    if (page === "checkout") setupCheckout();
    if (page === "tracking") setupTracking();

    if (page === "laporan" || page === "history") {
        setupReports();
    }
}

// ==================== LOGIN ====================

function setupLogin() {
    $("#fill-demo").addEventListener("click", () => {
        const form = $("#login-form");

        form.elements.email.value = "rina@gmail.com";
        form.elements.password.value = "rina123";

        form.elements.email.focus();
    });

    $("#toggle-password").addEventListener("click", () => {
        const input = $("#password");
        const tampil = input.type === "password";

        input.type = tampil ? "text" : "password";

        $("#toggle-password").textContent =
            tampil ? "Sembunyikan" : "Lihat";

        $("#toggle-password").setAttribute(
            "aria-label",
            tampil ? "Sembunyikan password" : "Tampilkan password"
        );
    });

    $("#login-form").addEventListener("submit", event => {
        event.preventDefault();

        const form = event.currentTarget;

        const email = form.elements.email.value
            .trim()
            .toLowerCase();

        const password = form.elements.password.value;

        const account = [...dataPengguna, ...users].find(
            akun =>
                akun.email.toLowerCase() === email &&
                akun.password === password
        );

        if (!account) {
            alert("email/password yang anda masukkan salah");
            return;
        }

        const session = {
            id: account.id,
            nama: account.nama,
            email: account.email,
            role: account.role
        };

        try {
            sessionStorage.setItem(
                key + "session",
                JSON.stringify(session)
            );

            location.href = "dashboard.html";
        } catch {
            alert("Aktifkan penyimpanan browser agar dapat login.");
        }
    });

    $("#forgot").addEventListener("click", () => {
        showModal(`
      <p class="eyebrow">BANTUAN AKUN</p>
      <h2>Lupa password?</h2>

      <p class="small muted">
        Masukkan email untuk mencoba alur pemulihan akun.
      </p>

      <form id="forgot-form">
        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
          >
        </label>

        <button class="button" type="submit">
          Lanjutkan →
        </button>
      </form>

      <p id="forgot-info" role="status"></p>
    `);

        $("#forgot-form").addEventListener("submit", event => {
            event.preventDefault();

            $("#forgot-info").textContent =
                "Ini simulasi front-end. Tautan reset tidak dikirim. " +
                "Gunakan akun contoh rina@gmail.com / rina123, " +
                "atau buat akun baru.";

            $("#forgot-info").className = "notice";
        });
    });

    $("#register").addEventListener("click", () => {
        showModal(`
      <p class="eyebrow">JADI BAGIAN DARI RUANG BACA</p>
      <h2>Mulai halaman pertamamu.</h2>

      <form id="register-form">
        <label>
          Nama lengkap
          <input
            name="nama"
            minlength="2"
            maxlength="100"
            autocomplete="name"
            required
          >
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            autocomplete="email"
            required
          >
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            minlength="6"
            autocomplete="new-password"
            required
          >
          <small class="muted">
            Minimal 6 karakter. Gunakan password khusus demo.
          </small>
        </label>

        <label>
          Konfirmasi password
          <input
            name="confirm"
            type="password"
            minlength="6"
            autocomplete="new-password"
            required
          >
        </label>

        <p class="small muted">
          Akun demo tersimpan di browser ini.
        </p>

        <button class="button" type="submit">
          Daftar sekarang →
        </button>
      </form>
    `);

        $("#register-form").addEventListener("submit", event => {
            event.preventDefault();

            const form = event.currentTarget;
            const nama = form.elements.nama.value.trim();

            const email = form.elements.email.value
                .trim()
                .toLowerCase();

            const password = form.elements.password.value;
            const confirm = form.elements.confirm.value;

            if (nama.length < 2) {
                toast("Nama minimal 2 karakter.");
                return;
            }

            const sudahAda = [...dataPengguna, ...users].some(
                akun => akun.email.toLowerCase() === email
            );

            if (sudahAda) {
                toast("Email sudah terdaftar.");
                return;
            }

            if (password !== confirm) {
                toast("Konfirmasi password tidak sama.");
                return;
            }

            const nextUsers = [
                ...users,
                {
                    id: Date.now(),
                    nama,
                    email,
                    password,
                    role: "User"
                }
            ];

            if (!write("users", nextUsers)) return;

            users = nextUsers;
            modal.close();

            $("#login-form").elements.email.value = email;

            toast("Akun berhasil dibuat. Silakan login.");
        });
    });
}

// ==================== DASHBOARD ====================

function setupDashboard() {
    const now = new Date();
    const hour = now.getHours();

    let greeting;

    if (hour < 11) {
        greeting = "pagi";
    } else if (hour < 15) {
        greeting = "siang";
    } else if (hour < 18) {
        greeting = "sore";
    } else {
        greeting = "malam";
    }

    const namaDepan = user.nama.split(" ")[0].toUpperCase();

    $("#greeting").textContent =
        `SELAMAT ${greeting.toUpperCase()}, ${namaDepan} ✧`;

    $("#today").textContent = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const totalStok = books.reduce(
        (total, book) => total + Number(book.stok),
        0
    );

    const pesananSaya = orders.filter(
        order => order.userId === user.id
    );

    $("#stats").innerHTML =
        stat(books.length, "Judul buku", "▤") +
        stat(
            totalStok.toLocaleString("id-ID"),
            "Total stok buku",
            "▦"
        ) +
        stat(pesananSaya.length, "Pesanan kamu", "↗") +
        stat(
            Object.keys(dataTracking).length + orders.length,
            "Data pengiriman",
            "◷"
        );

    $("#featured").innerHTML = books
        .slice(0, 5)
        .map(bookCard)
        .join("");

    bindAdd($("#featured"));
}

// ==================== KATALOG DAN STOK ====================

function setupCatalog() {
    let view = "grid";

    function render() {
        const keyword = $("#search").value.trim().toLowerCase();

        let list = books.filter(book => {
            const teks = (
                book.namaBarang + " " + book.kodeBarang
            ).toLowerCase();

            return teks.includes(keyword);
        });

        const sort = $("#sort").value;

        if (sort === "name") {
            list.sort((a, b) =>
                a.namaBarang.localeCompare(b.namaBarang)
            );
        }

        if (sort === "low") {
            list.sort((a, b) => price(a) - price(b));
        }

        if (sort === "high") {
            list.sort((a, b) => price(b) - price(a));
        }

        $("#book-count").textContent =
            `Menampilkan ${list.length} dari ${books.length} judul buku`;

        const target = $("#catalog");

        target.classList.toggle("table-mode", view === "table");

        if (!list.length) {
            target.innerHTML = empty(
                "Buku belum ditemukan.",
                "Coba kata kunci lain."
            );
            return;
        }

        if (view === "grid") {
            target.innerHTML = list.map(bookCard).join("");
        } else {
            target.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Buku</th>
                <th>Kode</th>
                <th>Jenis / Edisi</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Pesan</th>
              </tr>
            </thead>

            <tbody>
              ${list.map(book => `
                <tr>
                  <td>
                    <img
                      src="${cover(book)}"
                      alt="Sampul ${esc(book.namaBarang)}"
                    >
                    ${esc(book.namaBarang)}
                  </td>

                  <td>${esc(book.kodeBarang)}</td>

                  <td>
                    ${esc(book.jenisBarang)} /
                    ${esc(book.edisi)}
                  </td>

                  <td>${esc(book.stok)}</td>

                  <td>${money(price(book))}</td>

                  <td>
                    <button
                      class="add-cart"
                      data-add="${esc(book.kodeBarang)}"
                      aria-label="Pesan ${esc(book.namaBarang)}"
                      ${book.stok < 1 ? "disabled" : ""}
                    >
                      +
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
        }

        bindAdd(target);
    }

    $("#search").addEventListener("input", render);
    $("#sort").addEventListener("change", render);

    ["grid", "table"].forEach(type => {
        $("#" + type + "-view").addEventListener("click", () => {
            view = type;

            ["grid", "table"].forEach(item => {
                const aktif = item === type;
                const button = $("#" + item + "-view");

                button.classList.toggle("selected", aktif);
                button.setAttribute("aria-pressed", String(aktif));
            });

            render();
        });
    });

    $("#add-stock").addEventListener("click", () => {
        showModal(`
      <p class="eyebrow">KELOLA KOLEKSI</p>
      <h2>Tambahkan buku baru.</h2>

      <form id="stock-form">
        <div class="form-grid">
          <label>
            Kode buku
            <input
              name="code"
              pattern="[A-Za-z0-9_\\-]{2,30}"
              maxlength="30"
              placeholder="Contoh: BUKU1001"
              required
            >
          </label>

          <label>
            Edisi
            <input
              name="edition"
              type="number"
              min="1"
              max="99"
              step="1"
              value="1"
              required
            >
          </label>

          <label class="full">
            Judul buku
            <input
              name="title"
              minlength="2"
              maxlength="120"
              required
            >
          </label>

          <label>
            Stok
            <input
              name="stock"
              type="number"
              min="0"
              max="100000"
              step="1"
              required
            >
          </label>

          <label>
            Harga (Rupiah)
            <input
              name="price"
              type="number"
              min="1"
              max="100000000"
              step="1"
              required
            >
          </label>

          <label class="full">
            Sampul buku
            <select name="cover">
              ${dataKatalogBuku.map(book => `
                <option value="${esc(book.cover)}">
                  ${esc(book.namaBarang)}
                </option>
              `).join("")}
            </select>
          </label>
        </div>

        <p class="small muted">
          Menggunakan salah satu gambar yang kamu berikan.
          Data baru tersimpan di browser.
        </p>

        <button class="button" type="submit">
          Simpan buku →
        </button>
      </form>
    `);

        $("#stock-form").addEventListener("submit", event => {
            event.preventDefault();

            const form = event.currentTarget;

            const code = form.elements.code.value
                .trim()
                .toUpperCase();

            const title = form.elements.title.value.trim();
            const stok = Number(form.elements.stock.value);
            const harga = Number(form.elements.price.value);

            if (title.length < 2) {
                toast("Judul minimal 2 karakter.");
                return;
            }

            if (
                !Number.isInteger(stok) ||
                stok < 0 ||
                !Number.isInteger(harga) ||
                harga < 1
            ) {
                toast("Masukkan stok dan harga yang valid.");
                return;
            }

            const sudahAda = books.some(
                book => book.kodeBarang.toUpperCase() === code
            );

            if (sudahAda) {
                toast("Kode buku sudah digunakan. Masukkan kode baru.");
                return;
            }

            const newBook = {
                kodeBarang: code,
                namaBarang: title,
                jenisBarang: "Buku Ajar",
                edisi: form.elements.edition.value,
                stok: stok,
                harga: money(harga),
                cover: form.elements.cover.value
            };

            const nextBooks = [...books, newBook];

            if (!write("books", nextBooks)) return;

            books = nextBooks;

            modal.close();
            render();
            toast("Buku baru berhasil ditambahkan.");
        });
    });

    render();
}

// ==================== CHECKOUT ====================

function setupCheckout() {
    const form = $("#checkout-form");

    form.elements.nama.value = user.nama;
    form.elements.email.value = user.email;

    function render() {
        const items = cartDetails();

        const jumlahBuku = items.reduce(
            (total, item) => total + item.qty,
            0
        );

        $("#cart-count").textContent = jumlahBuku + " buku";

        if (!items.length) {
            $("#cart-items").innerHTML = empty(
                "Keranjangmu masih kosong.",
                "Pilih buku untuk memulai halaman baru."
            );
        } else {
            $("#cart-items").innerHTML = items.map(item => `
        <article class="cart-item">
          <img
            src="${cover(item.book)}"
            alt="Sampul ${esc(item.book.namaBarang)}"
          >

          <div class="cart-item-info">
            <h3>${esc(item.book.namaBarang)}</h3>
            <p class="muted">${money(price(item.book))}</p>
          </div>

          <div class="qty">
            <button
              data-qty="-1"
              data-code="${esc(item.code)}"
              aria-label="Kurangi ${esc(item.book.namaBarang)}"
            >
              −
            </button>

            <input
              type="number"
              min="1"
              max="${item.book.stok}"
              value="${item.qty}"
              data-amount="${esc(item.code)}"
              aria-label="Jumlah ${esc(item.book.namaBarang)}"
            >

            <button
              data-qty="1"
              data-code="${esc(item.code)}"
              aria-label="Tambah ${esc(item.book.namaBarang)}"
            >
              +
            </button>
          </div>

          <button
            class="remove"
            data-remove="${esc(item.code)}"
            aria-label="Hapus ${esc(item.book.namaBarang)}"
          >
            ×
          </button>
        </article>
      `).join("");
        }

        const subtotal = items.reduce(
            (total, item) => total + price(item.book) * item.qty,
            0
        );

        const ongkir = items.length ? 15000 : 0;

        $("#totals").innerHTML = `
      <div class="summary-row">
        <span class="muted">Subtotal buku</span>
        <span>${money(subtotal)}</span>
      </div>

      <div class="summary-row">
        <span class="muted">Ongkir simulasi</span>
        <span>${money(ongkir)}</span>
      </div>

      <div class="summary-row summary-total">
        <span>Total</span>
        <span>${money(subtotal + ongkir)}</span>
      </div>
    `;

        $$("[data-qty]").forEach(button => {
            button.addEventListener("click", () => {
                const item = cart.find(
                    item => item.code === button.dataset.code
                );

                const book = books.find(
                    book => book.kodeBarang === item.code
                );

                const nextQty =
                    item.qty + Number(button.dataset.qty);

                if (nextQty < 1 || nextQty > book.stok) {
                    toast("Jumlah harus antara 1 dan stok tersedia.");
                    return;
                }

                item.qty = nextQty;
                saveCart();
                render();
            });
        });

        $$("[data-amount]").forEach(input => {
            input.addEventListener("change", () => {
                const item = cart.find(
                    item => item.code === input.dataset.amount
                );

                const book = books.find(
                    book => book.kodeBarang === item.code
                );

                const nextQty = Number(input.value);

                if (
                    !Number.isInteger(nextQty) ||
                    nextQty < 1 ||
                    nextQty > book.stok
                ) {
                    toast("Jumlah tidak valid atau melebihi stok.");
                    input.value = item.qty;
                    return;
                }

                item.qty = nextQty;
                saveCart();
                render();
            });
        });

        $$("[data-remove]").forEach(button => {
            button.addEventListener("click", () => {
                cart = cart.filter(
                    item => item.code !== button.dataset.remove
                );

                saveCart();
                render();
            });
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const items = cartDetails();

        if (!items.length) {
            toast("Pilih minimal satu buku terlebih dahulu.");
            return;
        }

        const nama = form.elements.nama.value.trim();
        const alamat = form.elements.alamat.value.trim();

        if (nama.length < 2 || alamat.length < 10) {
            toast("Lengkapi nama dan alamat dengan benar.");
            return;
        }

        const jumlahSalah = items.some(item =>
            !Number.isInteger(item.qty) ||
            item.qty < 1 ||
            item.qty > item.book.stok
        );

        if (jumlahSalah) {
            toast("Jumlah buku tidak valid atau stok tidak cukup.");
            return;
        }

        const subtotal = items.reduce(
            (total, item) => total + price(item.book) * item.qty,
            0
        );

        showModal(`
      <p class="eyebrow">KONFIRMASI PESANAN</p>

      <h2>Siap memulai bacaan baru?</h2>

      <p class="small">
        Buku akan dikirim ke <strong>${esc(nama)}</strong>.
      </p>

      <p class="notice">
        Total simulasi:
        <strong>${money(subtotal + 15000)}</strong>
        <br>
        Metode: ${esc(form.elements.pembayaran.value)}
      </p>

      <p class="small muted">
        Ini pemesanan demo, tanpa pembayaran nyata.
      </p>

      <div class="modal-actions">
        <button class="button secondary" id="cancel-order">
          Periksa kembali
        </button>

        <button class="button" id="confirm-order">
          Konfirmasi pesanan →
        </button>
      </div>
    `);

        $("#cancel-order").addEventListener("click", () => {
            modal.close();
        });

        $("#confirm-order").addEventListener("click", () => {
            const id =
                "RB" +
                Date.now() +
                Math.floor(Math.random() * 1000)
                    .toString()
                    .padStart(3, "0");

            const order = {
                id,
                userId: user.id,
                nama,
                email: form.elements.email.value.trim(),
                telepon: form.elements.telepon.value.trim(),
                alamat,
                ekspedisi: form.elements.ekspedisi.value,
                pembayaran: form.elements.pembayaran.value,
                status: "Diproses",
                created: new Date().toISOString(),

                items: items.map(item => ({
                    code: item.code,
                    title: item.book.namaBarang,
                    qty: item.qty,
                    price: price(item.book)
                })),

                subtotal,
                ongkir: 15000,
                total: subtotal + 15000
            };

            const nextBooks = books.map(book => {
                const item = items.find(
                    item => item.code === book.kodeBarang
                );

                return item
                    ? { ...book, stok: book.stok - item.qty }
                    : book;
            });

            const nextOrders = [...orders, order];

            // Simpan satu checkpoint untuk memulihkan jika penulisan gagal.
            const previousOrders = orders;

            if (!write("orders", nextOrders)) return;

            if (!write("books", nextBooks)) {
                write("orders", previousOrders);
                return;
            }

            orders = nextOrders;
            books = nextBooks;
            cart = [];

            saveCart();
            render();
            modal.close();

            showModal(`
        <p class="eyebrow">PESANAN BERHASIL DIBUAT</p>

        <h2>
          Terima kasih, ${esc(nama.split(" ")[0])}!
        </h2>

        <p class="small">
          Simpan nomor Delivery Order untuk melacak pesanan.
        </p>

        <p class="notice">
          <strong>${esc(id)}</strong>
        </p>

        <p class="small muted">
          Status: Diproses. Pembayaran dan ongkir adalah simulasi.
        </p>

        <div class="modal-actions">
          <a class="button secondary" href="history.html">
            Riwayat pesanan
          </a>

          <a
            class="button"
            href="tracking.html?do=${encodeURIComponent(id)}"
          >
            Lacak pesanan →
          </a>
        </div>
      `);
        }, { once: true });
    });

    render();
}

// ==================== TRACKING ====================

function setupTracking() {
    function find(number) {
        const sample = Object.prototype.hasOwnProperty.call(
            dataTracking,
            number
        )
            ? dataTracking[number]
            : null;

        const order = orders.find(order => order.id === number);
        const target = $("#tracking-result");

        if (!sample && !order) {
            target.innerHTML = `
        <div class="panel error" role="alert">
          Nomor Delivery Order tidak ditemukan.
          Periksa kembali nomor yang kamu masukkan.
        </div>
      `;
            return;
        }

        const data = sample || {
            nomorDO: order.id,
            nama: order.nama,
            status: order.status,
            ekspedisi: order.ekspedisi,
            tanggalKirim: "Belum dikirim",
            paket: "Reguler",
            total: money(order.total),

            perjalanan: [
                {
                    waktu: new Date(order.created).toLocaleString("id-ID"),
                    keterangan:
                        "Pesanan dibuat dan menunggu proses pengiriman (simulasi)."
                }
            ]
        };

        const delivered = data.perjalanan.some(
            item => /Selesai Antar/i.test(item.keterangan)
        );

        const stage = delivered ? 4 : sample ? 3 : 1;

        const steps = [
            "Diproses",
            "Dikirim",
            "Dalam perjalanan",
            "Diterima"
        ];

        target.innerHTML = `
      <div class="panel">
        <div class="tracking-result-header">
          <div>
            <p class="eyebrow">
              DELIVERY ORDER · ${esc(data.nomorDO)}
            </p>

            <h2>${esc(data.nama)}</h2>
          </div>

          <span class="status">
            ${esc(data.status)}
          </span>
        </div>

        ${delivered
                ? `
              <p class="notice">
                Log perjalanan menunjukkan paket telah diterima.
                Label status asli pada data: ${esc(data.status)}.
              </p>
            `
                : ""
            }

        <div class="track-details">
          <div>
            <small>Ekspedisi</small>
            <strong>${esc(data.ekspedisi)}</strong>
          </div>

          <div>
            <small>Tanggal kirim</small>
            <strong>${esc(data.tanggalKirim)}</strong>
          </div>

          <div>
            <small>Jenis / kode paket</small>
            <strong>${esc(data.paket)}</strong>
          </div>

          <div>
            <small>Total pembayaran</small>
            <strong>${esc(data.total)}</strong>
          </div>
        </div>

        <div
          class="steps"
          aria-label="Tahap pengiriman ${stage} dari 4"
        >
          ${steps.map((text, index) => `
            <div class="step ${index < stage ? "done" : ""}">
              ${index < stage ? "✓" : "○"} ${text}
            </div>
          `).join("")}
        </div>

        <h3>Perjalanan paket</h3>

        <ol class="timeline">
          ${data.perjalanan.map(item => `
            <li>
              <time>${esc(item.waktu)}</time>
              ${esc(item.keterangan)}
            </li>
          `).join("")}
        </ol>
      </div>
    `;
    }

    $("#tracking-form").addEventListener("submit", event => {
        event.preventDefault();
        find($("#do-number").value.trim());
    });

    $$("[data-do]").forEach(button => {
        button.addEventListener("click", () => {
            $("#do-number").value = button.dataset.do;
            find(button.dataset.do);
        });
    });

    const initial = new URLSearchParams(
        location.search
    ).get("do");

    if (initial) {
        $("#do-number").value = initial;
        find(initial);
    }
}

// ==================== LAPORAN DAN RIWAYAT ====================

function setupReports() {
    const list = orders
        .filter(order =>
            user.role === "Admin" ||
            order.userId === user.id
        )
        .slice()
        .reverse();

    if (page === "laporan") {
        $("#print-report").addEventListener("click", () => {
            window.print();
        });

        const totalBuku = list.reduce(
            (jumlah, order) =>
                jumlah + order.items.reduce(
                    (total, item) => total + item.qty,
                    0
                ),
            0
        );

        const diproses = list.filter(
            order => order.status === "Diproses"
        ).length;

        const totalNilai = list.reduce(
            (jumlah, order) => jumlah + order.total,
            0
        );

        $("#report-stats").innerHTML =
            stat(list.length, "Total pesanan", "▤") +
            stat(totalBuku, "Buku dipesan", "▦") +
            stat(diproses, "Sedang diproses", "◷") +
            stat(money(totalNilai), "Nilai pesanan demo", "↗");

        if (!list.length) {
            $("#report-table").innerHTML = empty(
                "Belum ada pemesanan.",
                "Pesanan yang dibuat akan muncul di laporan ini."
            );
            return;
        }

        $("#report-table").innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nomor DO</th>
              <th>Pemesan</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Detail</th>
            </tr>
          </thead>

          <tbody>
            ${list.map(order => `
              <tr>
                <td>${esc(order.id)}</td>
                <td>${esc(order.nama)}</td>

                <td>
                  ${new Date(order.created).toLocaleDateString("id-ID")}
                </td>

                <td>${money(order.total)}</td>

                <td>
                  <span class="status">
                    ${esc(order.status)}
                  </span>
                </td>

                <td>
                  <a
                    class="text-link"
                    href="tracking.html?do=${encodeURIComponent(order.id)}"
                  >
                    Lacak →
                  </a>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

        return;
    }

    if (!list.length) {
        $("#history-list").innerHTML = empty(
            "Belum ada cerita transaksi.",
            "Pesan buku pertamamu dan riwayatnya akan tersimpan di sini."
        );
        return;
    }

    $("#history-list").innerHTML = list.map(order => `
    <article class="panel">
      <div class="order-header">
        <div>
          <p class="eyebrow">${esc(order.id)}</p>
          <h3>${esc(order.nama)}</h3>

          <p class="small muted">
            ${new Date(order.created).toLocaleString("id-ID")}
          </p>
        </div>

        <span class="status">
          ${esc(order.status)}
        </span>
      </div>

      <div class="order-lines">
        ${order.items.map(item => `
          <div class="summary-row">
            <span>
              ${esc(item.title)} × ${item.qty}
            </span>

            <strong>
              ${money(item.price * item.qty)}
            </strong>
          </div>
        `).join("")}

        <p class="small muted">
          ${esc(order.alamat)}<br>
          ${esc(order.ekspedisi)} · ${esc(order.pembayaran)}<br>
          Ongkir simulasi: ${money(order.ongkir)}
        </p>
      </div>

      <div class="order-footer">
        <strong>Total ${money(order.total)}</strong>

        <a
          class="button secondary"
          href="tracking.html?do=${encodeURIComponent(order.id)}"
        >
          Lacak pengiriman →
        </a>
      </div>
    </article>
  `).join("");
}