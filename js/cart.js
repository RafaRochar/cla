// Carrinho da Clã Ñandereko: fecha pedido via WhatsApp.
// Troque pelo número real da loja no formato internacional (DDI+DDD+número, só dígitos).
const WHATSAPP_NUMBER = "5512988016585";

const CART_STORAGE_KEY = "clanandereko_cart";

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* localStorage indisponível: carrinho segue só em memória */
  }
}

let cart = loadCart();

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
  renderCart();
}

function changeQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId] += delta;
  if (cart[productId] <= 0) delete cart[productId];
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart(cart);
  renderCart();
}

function getCartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart() {
  const badge = document.getElementById("cartBadge");
  const body = document.getElementById("cartBody");
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";

  const entries = Object.entries(cart);

  if (entries.length === 0) {
    body.innerHTML = `<p class="cart-empty">Ainda não tem nada por aqui. Escolha um produto e o pedido aparece assim que você adicionar o primeiro item.</p>`;
    return;
  }

  let subtotal = 0;
  let hasUnpriced = false;

  const itemsHtml = entries
    .map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return "";
      const lineTotal = product.price != null ? product.price * qty : null;
      if (lineTotal != null) subtotal += lineTotal;
      else hasUnpriced = true;
      return `
        <div class="cart-item">
          <div class="cart-item-media ${product.catClass}">
            ${product.image
              ? `<img src="${product.image}" alt="${product.name}">`
              : `<svg viewBox="0 0 64 64"><use href="#${product.icon}"/></svg>`}
          </div>
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            ${product.size ? `<div class="size">${product.size}</div>` : ""}
            <div class="qty-control">
              <button type="button" data-action="dec" data-id="${id}" aria-label="Diminuir quantidade">−</button>
              <span>${qty}</span>
              <button type="button" data-action="inc" data-id="${id}" aria-label="Aumentar quantidade">+</button>
              <button type="button" class="remove-item-btn" data-action="remove" data-id="${id}">remover</button>
            </div>
          </div>
          <div class="cart-item-price">${lineTotal != null ? formatBRL(lineTotal) : "a combinar"}</div>
        </div>`;
    })
    .join("");

  const summaryHtml = `
    <div class="cart-summary">
      <span>Subtotal</span>
      <span>${formatBRL(subtotal)}${hasUnpriced ? " + itens a combinar" : ""}</span>
    </div>`;

  body.innerHTML = itemsHtml + summaryHtml;
}

function buildWhatsappMessage() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const entries = Object.entries(cart);

  let subtotal = 0;
  let hasUnpriced = false;

  let msg = `Olá, Clã Ñandereko! Quero fazer um pedido:%0A%0A`;
  entries.forEach(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const sizeLabel = product.size ? ` (${product.size})` : "";
    if (product.price != null) {
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      msg += `• ${product.name}${sizeLabel}, Qtd: ${qty}, ${formatBRL(lineTotal)}%0A`;
    } else {
      hasUnpriced = true;
      msg += `• ${product.name}${sizeLabel}, Qtd: ${qty}, valor a combinar%0A`;
    }
  });
  msg += `%0ASubtotal: ${formatBRL(subtotal)}${hasUnpriced ? " + itens a combinar" : ""}%0A`;
  if (name) msg += `%0ANome: ${name}%0A`;
  if (phone) msg += `WhatsApp: ${phone}%0A`;
  msg += `%0APode confirmar a taxa de entrega e o prazo${hasUnpriced ? ", e o valor dos itens a combinar" : ""}?`;
  return msg;
}

function sendOrderToWhatsapp() {
  if (getCartCount() === 0) {
    alert("Seu carrinho está vazio. Adicione um produto antes de enviar o pedido.");
    return;
  }
  const message = buildWhatsappMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.getElementById("sendWhatsappBtn").addEventListener("click", sendOrderToWhatsapp);

renderCart();
