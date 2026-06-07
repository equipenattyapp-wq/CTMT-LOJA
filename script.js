const CART_KEY = "ctmt-cart";

const state = {
  cart: JSON.parse(localStorage.getItem(CART_KEY) || "[]"),
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const elements = {
  body: document.body,
  header: document.querySelector(".site-header"),
  cartDrawer: document.querySelector("[data-cart-drawer]"),
  cartOverlay: document.querySelector("[data-cart-overlay]"),
  cartItems: document.querySelector("[data-cart-items]"),
  cartEmpty: document.querySelector("[data-cart-empty]"),
  cartSummary: document.querySelector("[data-cart-summary]"),
  cartSubtotal: document.querySelector("[data-cart-subtotal]"),
  cartCounts: document.querySelectorAll("[data-cart-count]"),
  toast: document.querySelector("[data-toast]"),
  toastMessage: document.querySelector("[data-toast-message]"),
  menuToggle: document.querySelector(".menu-toggle"),
  mobileNav: document.querySelector(".mobile-nav"),
};

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function totalItems() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function subtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function iconForProduct(id) {
  if (id.includes("bandagem")) return "icon-wraps";
  if (id.includes("capacete")) return "icon-headgear";
  if (id.includes("bucal")) return "icon-mouthguard";
  if (id.includes("saco")) return "icon-bag";
  if (id.includes("camiseta") || id.includes("regata")) return "icon-shirt";
  return "icon-gloves";
}

function addProduct(product, quantity = 1) {
  const existing = state.cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ ...product, quantity });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} adicionado ao pedido`);
}

function updateQuantity(id, delta) {
  const item = state.cart.find((product) => product.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((product) => product.id !== id);
  }

  saveCart();
  renderCart();
}

function removeProduct(id) {
  state.cart = state.cart.filter((product) => product.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  elements.cartCounts.forEach((counter) => {
    counter.textContent = totalItems();
  });

  const hasItems = state.cart.length > 0;
  elements.cartEmpty.classList.toggle("is-visible", !hasItems);
  elements.cartSummary.classList.toggle("is-hidden", !hasItems);
  elements.cartItems.style.display = hasItems ? "block" : "none";
  elements.cartSubtotal.textContent = money.format(subtotal());

  elements.cartItems.innerHTML = state.cart.map((item) => `
    <article class="cart-item">
      <div class="cart-item-visual">
        <svg viewBox="0 0 240 220" aria-hidden="true">
          <use href="#${iconForProduct(item.id)}"></use>
        </svg>
      </div>
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <strong>${money.format(item.price)}</strong>
        <div class="quantity-control" aria-label="Quantidade de ${item.name}">
          <button type="button" data-decrease="${item.id}" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-increase="${item.id}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${item.id}" aria-label="Remover ${item.name}">×</button>
    </article>
  `).join("");
}

function openCart() {
  elements.body.classList.add("cart-open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.cartDrawer.querySelector("[data-close-cart]")?.focus(), 200);
}

function closeCart() {
  elements.body.classList.remove("cart-open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function setMobileMenu(open) {
  elements.body.classList.toggle("menu-open", open);
  elements.mobileNav.classList.toggle("is-open", open);
  elements.mobileNav.style.visibility = open ? "visible" : "hidden";
  elements.mobileNav.style.opacity = open ? "1" : "0";
  elements.mobileNav.style.transform = open ? "translateY(0)" : "translateY(-12px)";
  elements.menuToggle.setAttribute("aria-expanded", String(open));
  elements.menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toastMessage.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function checkout() {
  if (!state.cart.length) return;

  const itemLines = state.cart.map((item) => {
    const itemTotal = money.format(item.price * item.quantity);
    return `• ${item.quantity}x ${item.name} — ${itemTotal}`;
  });

  const message = [
    "Olá, CTMT! Quero fazer este pedido:",
    "",
    ...itemLines,
    "",
    `*Total: ${money.format(subtotal())}*`,
    "",
    "Vou retirar presencialmente no CT.",
    "Podem confirmar estoque, tamanhos e forma de pagamento?",
  ].join("\n");

  // Para abrir diretamente na conversa do CTMT, informe o número:
  // const whatsappNumber = "5511999999999";
  const whatsappNumber = "";
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.querySelectorAll("[data-add-product]").forEach((button) => {
  button.addEventListener("click", () => {
    addProduct({
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
    });
  });
});

document.querySelector("[data-add-kit]").addEventListener("click", () => {
  [
    { id: "luva-training-pro", name: "Luva CTMT Training Pro", price: 289.90 },
    { id: "bandagem-ctmt", name: "Bandagem CTMT 4,5m", price: 49.90 },
    { id: "protetor-bucal", name: "Protetor Bucal Impact", price: 39.90 },
  ].forEach((product) => addProduct(product));
  openCart();
});

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", openCart);
});

document.querySelectorAll("[data-close-cart]").forEach((button) => {
  button.addEventListener("click", closeCart);
});

elements.cartOverlay.addEventListener("click", closeCart);

elements.cartItems.addEventListener("click", (event) => {
  const decrease = event.target.closest("[data-decrease]");
  const increase = event.target.closest("[data-increase]");
  const remove = event.target.closest("[data-remove]");

  if (decrease) updateQuantity(decrease.dataset.decrease, -1);
  if (increase) updateQuantity(increase.dataset.increase, 1);
  if (remove) removeProduct(remove.dataset.remove);
});

document.querySelector("[data-checkout]").addEventListener("click", checkout);

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visible = 0;

    document.querySelectorAll(".filter-button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    document.querySelectorAll(".product-card").forEach((card) => {
      const matches = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !matches);
      if (matches) visible += 1;
    });

    document.querySelector("[data-visible-count]").textContent = visible;
  });
});

elements.menuToggle.addEventListener("click", () => {
  const willOpen = !elements.body.classList.contains("menu-open");
  setMobileMenu(willOpen);
});

document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    setMobileMenu(false);
  });
});

window.addEventListener("scroll", () => {
  elements.header.classList.toggle("is-scrolled", window.scrollY > 24);
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    setMobileMenu(false);
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
renderCart();
