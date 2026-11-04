"use strict";

(function buatLayout() {
    const halaman = document.body.dataset.page;

    const icons = {
        home: `
      <path d="m3 10 9-7 9 7v10H3z"/>
      <path d="M9 20v-7h6v7"/>
    `,
        book: `
      <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z"/>
      <path d="M12 5v15"/>
    `,
        bag: `
      <rect x="4" y="7" width="16" height="14" rx="3"/>
      <path d="M8 8V6a4 4 0 0 1 8 0v2"/>
    `,
        truck: `
      <path d="M2 5h12v12H2zM14 10h4l4 4v3h-8"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    `,
        chart: `
      <path d="M4 3v18h17M8 16v-5M13 16V7M18 16v-9"/>
    `,
        clock: `
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 6v6l4 2"/>
    `,
        logout: `
      <path d="M9 4H4v16h5m5-13 5 5-5 5M8 12h12"/>
    `
    };

    function icon(nama) {
        return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${icons[nama]}
      </svg>
    `;
    }

    const menu = [
        ["dashboard", "Beranda", "home"],
        ["stok", "Katalog Buku", "book"],
        ["checkout", "Pemesanan", "bag"],
        ["tracking", "Lacak Pengiriman", "truck"],
        ["laporan", "Laporan Pesanan", "chart"],
        ["history", "Riwayat Transaksi", "clock"]
    ];

    if (halaman !== "login") {
        const judul = menu.find(item => item[0] === halaman)?.[1]
            || "Ruang Baca";

        const sidebar = document.createElement("aside");
        sidebar.className = "sidebar";

        sidebar.innerHTML = `
      <a class="brand" href="dashboard.html">
        <span class="brand-icon">${icon("book")}</span>

        <span>
          ruang<span class="brand-light">baca</span>
          <small>TEMAN TUMBUH PIKIRAN</small>
        </span>
      </a>

      <p class="nav-label">RUANG UTAMA</p>

      <nav aria-label="Navigasi utama">
        ${menu.map(([file, nama, simbol]) => `
          <a
            href="${file}.html"
            ${file === halaman
                ? 'class="active" aria-current="page"'
                : ""}
          >
            ${icon(simbol)}
            <span>${nama}</span>

            ${file === "checkout"
                ? '<span class="cart-badge" data-cart-count>0</span>'
                : ""}
          </a>
        `).join("")}
      </nav>

      <div class="sidebar-note">
        <span>✧</span>
        <h3>Satu buku.<br>Banyak kemungkinan.</h3>
        <p>Luangkan waktu untuk<br>halaman berikutnya.</p>
      </div>

      <div class="profile">
        <span class="avatar" id="avatar">R</span>

        <div>
          <strong id="user-name">Pembaca</strong>
          <small id="user-role">Anggota Ruang Baca</small>
        </div>

        <button id="logout" aria-label="Keluar">
          ${icon("logout")}
        </button>
      </div>
    `;

        document.body.prepend(sidebar);

        const main = document.querySelector("main");
        const workspace = document.createElement("div");

        workspace.className = "workspace";
        main.replaceWith(workspace);

        workspace.innerHTML = `
      <header class="topbar">
        <button
          id="mobile-menu"
          aria-label="Buka navigasi"
          aria-expanded="false"
        >
          ☰
        </button>

        <span class="breadcrumb">
          Ruang Baca <span>/</span> <strong>${judul}</strong>
        </span>

        <a class="top-cart" href="checkout.html">
          ${icon("bag")}
          <span>Keranjang</span>
          <b data-cart-count>0</b>
        </a>
      </header>
    `;

        workspace.append(main);

        workspace.insertAdjacentHTML("beforeend", `
      <footer>
        <span>© <span id="year"></span> Ruang Baca</span>
        <span>Ruang kecil untuk ide-ide besar.</span>
      </footer>
    `);
    }

    document.body.insertAdjacentHTML("beforeend", `
    <dialog id="modal">
      <div id="modal-content"></div>
    </dialog>

    <div id="toast" role="status" aria-live="polite"></div>
  `);
})();