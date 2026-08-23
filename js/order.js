(function () {
  "use strict";

  // TODO: reemplazar por el WhatsApp real del local antes de publicar.
  var WHATSAPP_NUMBER = "5491100000000";

  var FRIES = [
    { id: "papas", name: "Porción de papas", price: 7000 },
    { id: "papas-cheddar", name: "Porción de papas + cheddar", price: 7500 },
    { id: "papas-cheddar-bacon", name: "Porción de papas + cheddar & bacon", price: 8000 }
  ];

  var EXTRAS = [
    { id: "extra-carne-cheddar", name: "Extra carne y cheddar", price: 4000 },
    { id: "extra-cheddar", name: "Cheddar extra", price: 1500 },
    { id: "extra-cheddar-panceta", name: "Cheddar y panceta", price: 2500 }
  ];

  var body = document.body;
  var orderView = document.getElementById("orderView");
  var orderBurgersEl = document.getElementById("orderBurgers");
  var orderFriesEl = document.getElementById("orderFries");
  var cartItemsEl = document.getElementById("orderCartItems");
  var totalEl = document.getElementById("orderTotal");
  var errorEl = document.getElementById("orderError");
  var nameInput = document.getElementById("orderName");
  var addressField = document.getElementById("orderAddressField");
  var addressInput = document.getElementById("orderAddress");
  var fulfillmentToggle = document.getElementById("orderFulfillment");
  var paymentToggle = document.getElementById("orderPayment");
  var sendBtn = document.getElementById("orderSend");
  var backBtn = document.getElementById("orderBack");

  var cart = []; // { key, name, qty, unitPrice, extraNames, lineTotal }
  var fulfillment = "takeaway";
  var payment = "efectivo";
  var burgersLoaded = false;

  function formatPrice(n) {
    return "$" + Math.round(n).toLocaleString("es-AR");
  }

  function parsePrice(str) {
    return parseInt(String(str).replace(/[^\d]/g, ""), 10) || 0;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  /* ---------- Build the pickers ---------- */
  function renderBurgers(items) {
    if (!items.length) {
      orderBurgersEl.innerHTML = '<p class="menu-loading">No hay hamburguesas cargadas.</p>';
      return;
    }
    orderBurgersEl.innerHTML = items.map(function (item) {
      var extrasHtml = EXTRAS.map(function (ex) {
        return (
          '<label class="order-extra">' +
            '<input type="checkbox" value="' + ex.id + '" />' +
            '<span>' + escapeHtml(ex.name) + ' (+' + formatPrice(ex.price) + ')</span>' +
          '</label>'
        );
      }).join("");

      var photo = item.image
        ? '<img src="' + escapeHtml(item.image) + '" alt="Burger ' + escapeHtml(item.name) + '" loading="lazy" />'
        : "";

      return (
        '<article class="order-item" data-id="' + escapeHtml(item.id) + '" data-price="' + parsePrice(item.price) + '" data-name="' + escapeHtml(item.name) + '">' +
          photo +
          '<div class="order-item__info">' +
            '<h4>' + escapeHtml(item.name) + '<span class="order-item__price">' + escapeHtml(item.price) + '</span></h4>' +
            '<p>' + escapeHtml(item.description) + '</p>' +
            '<div class="order-item__extras">' + extrasHtml + '</div>' +
            '<div class="order-item__actions">' +
              qtyStepperHtml() +
              '<button type="button" class="btn btn--secondary btn--sm order-add">Agregar</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderFries() {
    orderFriesEl.innerHTML = FRIES.map(function (fry) {
      return (
        '<article class="order-item order-item--fries" data-id="' + fry.id + '" data-price="' + fry.price + '" data-name="' + escapeHtml(fry.name) + '">' +
          '<div class="order-item__info">' +
            '<h4>' + escapeHtml(fry.name) + '<span class="order-item__price">' + formatPrice(fry.price) + '</span></h4>' +
            '<div class="order-item__actions">' +
              qtyStepperHtml() +
              '<button type="button" class="btn btn--secondary btn--sm order-add">Agregar</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function qtyStepperHtml() {
    return (
      '<div class="qty-stepper">' +
        '<button type="button" class="qty-btn" data-dir="-1" aria-label="Restar">−</button>' +
        '<span class="qty-value">1</span>' +
        '<button type="button" class="qty-btn" data-dir="1" aria-label="Sumar">+</button>' +
      '</div>'
    );
  }

  /* ---------- Qty steppers ---------- */
  function onStepperClick(e) {
    var btn = e.target.closest(".qty-btn");
    if (!btn) return;
    var valueEl = btn.parentElement.querySelector(".qty-value");
    var next = parseInt(valueEl.textContent, 10) + parseInt(btn.dataset.dir, 10);
    valueEl.textContent = Math.max(1, Math.min(9, next));
  }

  orderBurgersEl.addEventListener("click", onStepperClick);
  orderFriesEl.addEventListener("click", onStepperClick);

  /* ---------- Add to cart ---------- */
  function addLine(key, name, qty, unitPrice, extraNames) {
    var existing = cart.filter(function (l) { return l.key === key; })[0];
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ key: key, name: name, qty: qty, unitPrice: unitPrice, extraNames: extraNames });
    }
    renderCart();
  }

  orderBurgersEl.addEventListener("click", function (e) {
    if (!e.target.closest(".order-add")) return;
    var card = e.target.closest(".order-item");
    var qty = parseInt(card.querySelector(".qty-value").textContent, 10);
    var basePrice = parseInt(card.dataset.price, 10);
    var name = card.dataset.name;

    var extraNames = [];
    var extraPrice = 0;
    card.querySelectorAll(".order-extra input:checked").forEach(function (input) {
      var extra = EXTRAS.filter(function (ex) { return ex.id === input.value; })[0];
      if (extra) {
        extraNames.push(extra.name);
        extraPrice += extra.price;
      }
    });

    var key = card.dataset.id + "|" + extraNames.slice().sort().join(",");
    addLine(key, name, qty, basePrice + extraPrice, extraNames);

    // reset the card's inline controls
    card.querySelector(".qty-value").textContent = "1";
    card.querySelectorAll(".order-extra input:checked").forEach(function (input) { input.checked = false; });
  });

  orderFriesEl.addEventListener("click", function (e) {
    if (!e.target.closest(".order-add")) return;
    var card = e.target.closest(".order-item");
    var qty = parseInt(card.querySelector(".qty-value").textContent, 10);
    var price = parseInt(card.dataset.price, 10);
    addLine(card.dataset.id, card.dataset.name, qty, price, []);
    card.querySelector(".qty-value").textContent = "1";
  });

  /* ---------- Cart rendering ---------- */
  function cartTotal() {
    return cart.reduce(function (sum, l) { return sum + l.unitPrice * l.qty; }, 0);
  }

  function renderCart() {
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="order-cart__empty">Todavía no agregaste nada.</p>';
    } else {
      cartItemsEl.innerHTML = cart.map(function (line, i) {
        var extras = line.extraNames.length
          ? '<span class="cart-line__extras">+ ' + line.extraNames.map(escapeHtml).join(", ") + '</span>'
          : "";
        return (
          '<div class="cart-line">' +
            '<div class="cart-line__info">' +
              '<strong>' + line.qty + 'x ' + escapeHtml(line.name) + '</strong>' +
              extras +
            '</div>' +
            '<div class="cart-line__right">' +
              '<span>' + formatPrice(line.unitPrice * line.qty) + '</span>' +
              '<button type="button" class="cart-line__remove" data-i="' + i + '" aria-label="Quitar">✕</button>' +
            '</div>' +
          '</div>'
        );
      }).join("");
    }
    totalEl.textContent = formatPrice(cartTotal());
  }

  cartItemsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".cart-line__remove");
    if (!btn) return;
    cart.splice(parseInt(btn.dataset.i, 10), 1);
    renderCart();
  });

  /* ---------- Toggles ---------- */
  function wireToggle(el, onChange) {
    el.addEventListener("click", function (e) {
      var btn = e.target.closest(".order-toggle__btn");
      if (!btn) return;
      el.querySelectorAll(".order-toggle__btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      onChange(btn.dataset.value);
    });
  }

  wireToggle(fulfillmentToggle, function (value) {
    fulfillment = value;
    addressField.hidden = value !== "delivery";
  });

  wireToggle(paymentToggle, function (value) {
    payment = value;
  });

  /* ---------- Load menu (burgers) ---------- */
  function loadBurgers() {
    if (burgersLoaded) return;
    burgersLoaded = true;
    fetch("menu.json", { cache: "no-store" })
      .then(function (res) { return res.json(); })
      .then(renderBurgers)
      .catch(function () {
        orderBurgersEl.innerHTML = '<p class="menu-loading">No pudimos cargar el menú. Volvé a intentar más tarde.</p>';
        burgersLoaded = false;
      });
  }

  renderFries();

  /* ---------- Send to WhatsApp ---------- */
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
  }

  sendBtn.addEventListener("click", function () {
    clearError();

    if (!cart.length) {
      showError("Agregá al menos una hamburguesa o unas papas a tu pedido.");
      return;
    }
    var name = nameInput.value.trim();
    if (!name) {
      showError("Contanos a nombre de quién es el pedido.");
      nameInput.focus();
      return;
    }
    var address = addressInput.value.trim();
    if (fulfillment === "delivery" && !address) {
      showError("Ingresá la dirección de entrega.");
      addressInput.focus();
      return;
    }

    var lines = [];
    lines.push("👑 *Nuevo pedido - Smash King*");
    lines.push("");
    lines.push("*Pedido:*");
    cart.forEach(function (line) {
      lines.push(line.qty + "x " + line.name + " — " + formatPrice(line.unitPrice * line.qty));
      line.extraNames.forEach(function (ex) { lines.push("   + " + ex); });
    });
    lines.push("");
    lines.push("*Entrega:* " + (fulfillment === "delivery" ? "Delivery — " + address : "Retiro en el local"));
    lines.push("*Pago:* " + (payment === "efectivo" ? "Efectivo" : "Transferencia"));
    lines.push("*Nombre:* " + name);
    lines.push("");
    lines.push("*Total: " + formatPrice(cartTotal()) + "*");

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");
  });

  /* ---------- Overlay open/close (mirrors the full-menu view) ---------- */
  var orderHistoryPushed = false;

  function openOrderView(e) {
    if (e) e.preventDefault();
    loadBurgers();
    orderView.classList.add("is-open");
    orderView.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    orderView.scrollTop = 0;
    if (location.hash !== "#pedido") {
      history.pushState({ orderView: true }, "", "#pedido");
      orderHistoryPushed = true;
    }
  }

  function closeOrderView(scrollToTop) {
    if (!orderView.classList.contains("is-open")) return;
    orderView.classList.remove("is-open");
    orderView.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    if (location.hash === "#pedido") {
      if (orderHistoryPushed) {
        history.back();
      } else {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }
    orderHistoryPushed = false;
    if (scrollToTop) {
      var target = document.getElementById("inicio");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  }

  var openBtns = [
    document.getElementById("openOrderHeader"),
    document.getElementById("openOrderCta"),
    document.getElementById("openOrderMobile"),
    document.getElementById("openOrderFloating")
  ];
  openBtns.forEach(function (btn) {
    if (btn) btn.addEventListener("click", openOrderView);
  });

  backBtn.addEventListener("click", function (e) {
    e.preventDefault();
    closeOrderView(true);
  });

  window.addEventListener("popstate", function () {
    if (location.hash !== "#pedido") closeOrderView(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeOrderView(false);
  });

  if (location.hash === "#pedido") openOrderView();
})();
