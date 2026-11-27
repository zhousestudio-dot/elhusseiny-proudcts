(function () {
  var qtyInput = document.getElementById("pdp-qty");
  var waBtn = document.getElementById("pdp-whatsapp-btn");

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

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !qtyInput) return;

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
