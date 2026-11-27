(function () {
  var qtyInput = document.getElementById("pdp-qty");
  var waBtn = document.getElementById("pdp-whatsapp-btn");
  var addBtn = document.getElementById("pdp-add-btn");
  var priceEl = document.getElementById("pdp-price");

  function getClampedQty() {
    if (!qtyInput) return 1;
    var max = Number(qtyInput.getAttribute("max") || 50) || 50;
    var val = Math.floor(Number(qtyInput.value || 1));
    if (!Number.isFinite(val) || val < 1) val = 1;
    if (val > max) val = max;
    qtyInput.value = String(val);
    return val;
  }

  function syncWhatsAppLink() {
    if (!waBtn) return;
    var qty = getClampedQty();
    var phone = waBtn.dataset.waPhone || "201010231211";
    var name = waBtn.dataset.productName || "";
    var price = Number(waBtn.dataset.unitPrice || 0);
    var total = qty * price;
    var msg =
      "مرحباً، أود طلب: " +
      name +
      " — الكمية: " +
      qty +
      " (الإجمالي: " +
      total +
      " ج.م.)";
    waBtn.href =
      "https://api.whatsapp.com/send?phone=" +
      encodeURIComponent(phone) +
      "&text=" +
      encodeURIComponent(msg);
  }

  function formatEGP(amount) {
    try {
      return new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return amount + " ج.م.";
    }
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (target && target.nodeType === 3) target = target.parentElement;
    if (!target) return;

    var weightBtn = target.closest ? target.closest("[data-pdp-weight]") : null;
    if (weightBtn) {
      var wrap = weightBtn.closest("[data-pdp-base-id]");
      var baseId = wrap ? wrap.getAttribute("data-pdp-base-id") || "" : "";
      var baseName = wrap ? wrap.getAttribute("data-pdp-base-name") || "" : "";
      var label = weightBtn.getAttribute("data-weight-label") || "";
      var price = Number(weightBtn.getAttribute("data-weight-price") || 0);

      var allWeightBtns = document.querySelectorAll("[data-pdp-weight]");
      for (var i = 0; i < allWeightBtns.length; i++) {
        var b = allWeightBtns[i];
        b.className =
          b === weightBtn
            ? "rounded-xl bg-emerald-800 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
            : "rounded-xl border border-stone-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 hover:border-emerald-700 transition-colors cursor-pointer";
      }

      if (priceEl && price > 0) priceEl.textContent = formatEGP(price);

      var fullName = label ? baseName + " (" + label + ")" : baseName;
      if (addBtn && price > 0) {
        addBtn.dataset.productId = label ? baseId + "::" + label : baseId;
        addBtn.dataset.productName = fullName;
        addBtn.dataset.productPrice = String(price);
      }
      if (waBtn && price > 0) {
        waBtn.dataset.productName = fullName;
        waBtn.dataset.unitPrice = String(price);
        syncWhatsAppLink();
      }
      return;
    }

    if (!qtyInput) return;

    if (target.closest && target.closest("#pdp-qty-dec")) {
      var nextDec = Math.max(1, getClampedQty() - 1);
      qtyInput.value = String(nextDec);
      syncWhatsAppLink();
    } else if (target.closest && target.closest("#pdp-qty-inc")) {
      var max = Number(qtyInput.getAttribute("max") || 50) || 50;
      var nextInc = Math.min(max, getClampedQty() + 1);
      qtyInput.value = String(nextInc);
      syncWhatsAppLink();
    }
  });

  if (qtyInput) {
    qtyInput.addEventListener("input", syncWhatsAppLink);
    qtyInput.addEventListener("change", syncWhatsAppLink);
  }

  syncWhatsAppLink();
})();
