// Renderização do catálogo, filtros, menu mobile e gaveta do carrinho.

function renderProducts(filter = "all") {
  const grid = document.getElementById("productsGrid");
  const items = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  grid.innerHTML = items
    .map(
      (p) => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media ${p.catClass}">
          <span class="product-tag">${p.categoryLabel}</span>
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
            : `<svg viewBox="0 0 64 64"><use href="#${p.icon}"/></svg>`}
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          ${p.size ? `<div class="product-size">${p.size}</div>` : ""}
          <p class="product-desc">${p.desc}</p>
          <div class="product-footer">
            <span class="product-price-note">${p.price != null ? formatBRL(p.price) : "valor pelo chat"}</span>
            <button type="button" class="add-cart-btn" data-add="${p.id}">+ Carrinho</button>
          </div>
        </div>
      </article>`
    )
    .join("");
}

function initFilters() {
  const tabs = document.querySelectorAll(".filter-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      renderProducts(tab.dataset.filter);
    });
  });
}

function initAddToCart() {
  document.getElementById("productsGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(btn.dataset.add);
    const original = btn.textContent;
    btn.textContent = "Adicionado";
    btn.classList.add("is-added");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-added");
    }, 1000);
  });
}

function initCartDrawer() {
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");

  const open = () => {
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
  };
  const close = () => {
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
  };

  document.getElementById("openCartBtn").addEventListener("click", open);
  document.getElementById("ctaOpenCart").addEventListener("click", open);
  document.getElementById("closeCartBtn").addEventListener("click", close);
  overlay.addEventListener("click", close);
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("is-open"))
  );
}

function initFloatingWhatsapp() {
  document.getElementById("floatingWhatsapp").addEventListener("click", () => {
    document.getElementById("openCartBtn").click();
  });
}

function startSlideshow(slides, intervalMs) {
  if (slides.length < 2) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove("is-active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("is-active");
  }, intervalMs);
}

function initHeroSlideshow() {
  startSlideshow(document.querySelectorAll(".hero-slide"), 6000);
}

function initAssentamentoSlideshow() {
  startSlideshow(document.querySelectorAll(".assentamento-slide"), 5000);
}

function initLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  const open = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add("is-open");
  };
  const close = () => {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
  };

  document.addEventListener("click", (e) => {
    const img = e.target.closest(".product-media img, .cart-item-media img, .apiario-photo img, .servico-flyer img");
    if (!img) return;
    open(img.src, img.alt);
  });

  document.getElementById("lightboxClose").addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
initFilters();
initAddToCart();
initCartDrawer();
initMobileNav();
initFloatingWhatsapp();
initHeroSlideshow();
initAssentamentoSlideshow();
initLightbox();
