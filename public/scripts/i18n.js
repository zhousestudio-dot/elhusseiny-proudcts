(function () {
  var AR_TO_EN = {
    "منتجات الحسيني": "Elhusseiny Products",
    "طبيعي .. أصيل .. فاخر": "Natural .. Authentic .. Premium",
    "الرئيسية": "Home",
    "المنتجات": "Products",
    "العروض": "Offers",
    "السلة": "Cart",
    "يوجد شحن": "Shipping Available",
    "دفع آمن بالفيزا أو المحافظ الإلكترونية": "Secure Card & E-Wallet Payments",
    "من الإنتاج للبيت مباشرة — طبيعي ١٠٠٪": "Farm to Home — 100% Natural",
    "تصفح العروض": "Browse Offers",
    "كل المنتجات": "All Products",
    "خامات طبيعية ١٠٠٪": "100% Natural Ingredients",
    "محافظ إلكترونية وكاش": "E-Wallets & Cash",
    "ضمان الجودة والنقاء": "Quality & Purity Guaranteed",
    "الأقسام": "Categories",
    "عرض الكل": "View All",
    "باقات حصرية": "Exclusive Bundles",
    "عروض التوفير والخلطات": "Value Offers & Blends",
    "كل العروض ←": "All Offers →",
    "الأكثر مبيعاً": "Best Sellers",
    "منتجاتنا الأساسية": "Core Products",
    "جودة يمكنك الوثوق بها": "Quality You Can Trust",
    "لماذا يختار عملاؤنا منتجات الحسيني؟": "Why Choose Elhusseiny Products?",
    "نلتزم بتقديم منتجات غذائية طبيعية من أجود الخامات بدون أي زيوت مهدرجة أو إضافات صناعية.": "We craft 100% natural foods from the finest raw ingredients with zero hydrogenated oils or artificial additives.",
    "طحينة وزيت عصر على البارد": "Cold-Pressed Tahina & Olive Oil",
    "طحينة سمسم صافي ١٠٠٪ بدون دقيق أو إضافات، وزيت زيتون بكر ممتاز بحموضة أقل من 0.8%.": "100% pure sesame tahina with zero fillers, and extra virgin olive oil under 0.8% acidity.",
    "عسل نحل خام غير مبستر": "Raw Unpasteurized Honey",
    "عسل موالح وبرسيم وحبة البركة محتفظ بجميع إنزيماته وفوائده الطبيعية من المنحل مباشرة.": "Citrus, clover, and black seed honey retaining all natural enzymes straight from the apiary.",
    "تغليف محكم وتوصيل سريع": "Sealed Packaging & Fast Delivery",
    "تغليف آمن يحفظ الطعم الطازج مع شحن سريع لجميع محافظات مصر ومتابعة عبر الواتساب.": "Airtight packaging preserving fresh flavor with shipping across Egypt and WhatsApp support.",
    "الأسئلة الشائعة": "Frequently Asked Questions",
    "ما هي طرق الدفع المتاحة؟": "What payment methods are available?",
    "كم تستغرق مدة التوصيل داخل مصر؟": "How long does delivery take in Egypt?",
    "هل المنتجات تحتوي على أي مواد حافظة أو زيوت مهدرجة؟": "Do products contain preservatives or hydrogenated oils?",
    "لا، جميع منتجات الحسيني طبيعية ١٠٠٪ بدون أي مواد حافظة أو ألوان صناعية أو زيوت مهدرجة.": "No, all Elhusseiny products are 100% natural with zero preservatives, artificial colors, or hydrogenated oils.",
    "أضف للسلة": "Add to Cart",
    "أضف إلى السلة": "Add to Cart",
    "غير متوفر": "Out of Stock",
    "غير متوفر حالياً": "Currently Unavailable",
    "نفدت الكمية": "Out of Stock",
    "عرض توفير": "Value Offer",
    "متابعة التسوق": "Continue Shopping",
    "جميع المنتجات": "All Products",
    "إتمام الطلب": "Checkout",
    "عرض السلة": "View Cart",
    "سلة التسوق": "Shopping Cart",
    "السلة فارغة حالياً": "Your cart is currently empty",
    "سلة التسوق فارغة حالياً": "Your cart is currently empty",
    "ابدأ بإضافة منتجات الحسيني الطبيعية": "Start adding natural Elhusseiny products",
    "تصفح المنتجات": "Browse Products",
    "الإجمالي التقديري": "Estimated Total",
    "تم الإضافة إلى السلة": "Added to Cart",
    "روابط ومعلومات": "Links & Info",
    "عروض التوفير": "Value Offers",
    "سياسة الاستبدال والاسترجاع": "Return & Exchange Policy",
    "سياسة الخصوصية": "Privacy Policy",
    "الشروط وسياسة الشحن": "Terms & Shipping Policy",
    "تواصل معنا": "Contact Us",
    "تواصل عبر واتساب": "Chat on WhatsApp",
    "محافظ إلكترونية": "E-Wallets",
    "بيانات التوصيل": "Delivery Details",
    "ملخص الطلب": "Order Summary",
    "الإجمالي": "Total",
    "وصف المنتج": "Product Description",
    "منتجات قد تعجبك": "You May Also Like",
    "اطلب سريعاً عبر واتساب": "Quick Order via WhatsApp",
    "الترتيب الافتراضي": "Default Sorting",
    "السعر: من الأقل للأعلى": "Price: Low to High",
    "السعر: من الأعلى للأقل": "Price: High to Low",
    "الاسم: أ - ي": "Name: A - Z",
    "منتجات أساسية": "Core Products",
    "عسل ومنتجات النحل": "Honey & Bee Products",
    "الحلاوة وزيت الزيتون": "Halawa & Olive Oil",
    "عروض وخلطات خاصة": "Special Offers & Blends",
    "طحينة سمسم خام ١٠٠٪ (١ كيلو)": "100% Raw Sesame Tahina (1 kg)",
    "زيت زيتون بكر ممتاز (١ كيلو)": "Extra Virgin Olive Oil (1 kg)",
    "عسل بالمكسرات الفاخر (١ كيلو)": "Luxury Honey with Nuts (1 kg)",
    "المختوم الفلسطيني (١ كيلو)": "Palestinian Makhtoum Blend (1 kg)",
    "زبدة الفول السوداني الطبيعي (١ كيلو)": "Natural Peanut Butter (1 kg)",
    "زبدة الفول السوداني بالشوكولاتة (١ كيلو)": "Chocolate Peanut Butter (1 kg)",
    "عسل حبة البركة الطبيعي (١ كيلو)": "Natural Black Seed Honey (1 kg)",
    "عسل نوارة البرسيم (١ كيلو)": "Clover Blossom Honey (1 kg)",
    "عسل الموالح الطبيعي (١ كيلو)": "Natural Citrus Honey (1 kg)",
    "عسل أسود طبيعي (١ كيلو)": "Natural Blackstrap Molasses (1 kg)",
    "حلاوة طحينية سادة (١ كيلو)": "Plain Tahina Halawa (1 kg)",
    "حلاوة طحينية بالشوكولاتة (١ كيلو)": "Chocolate Tahina Halawa (1 kg)",
    "عرض: ½ عسل بالمكسرات + ½ عسل حبة البركة": "Offer: 1/2 kg Nut Honey + 1/2 kg Black Seed Honey",
    "عرض: ½ عسل برسيم + ½ عسل حبة البركة": "Offer: 1/2 kg Clover Honey + 1/2 kg Black Seed Honey",
    "عرض: كيلو وربع طحينة سمسم خام": "Offer: 1.25 kg Raw Sesame Tahina",
    "عرض: ½ مختوم فلسطيني + ½ عسل برسيم": "Offer: 1/2 kg Makhtoum + 1/2 kg Clover Honey",
    "عرض التوفير: ¼ طحينة + ¼ زبدة فول + ¼ زيت زيتون": "Saving Trio: 1/4 Tahina + 1/4 Peanut Butter + 1/4 Olive Oil"
  };

  var PLACEHOLDERS_EN = {
    "ابحث عن طحينة، عسل، زبدة فول سوداني...": "Search tahina, honey, peanut butter...",
    "ابحث عن طحينة، عسل، مختوم...": "Search tahina, honey, makhtoum...",
    "ابحث عن منتج (مثال: طحينة، عسل، مختوم)...": "Search products (e.g. tahina, honey)...",
    "مثال: أحمد محمد الحسيني": "e.g. Ahmed Elhusseiny",
    "اسم الشارع، رقم العقار، الدور، الشقة، وأقرب علامة مميزة": "Street, building, floor, apartment, landmark"
  };

  function translateNode(el, toLang) {
    if (toLang === "en") {
      if (el.dataset.arText === undefined) {
        var raw = el.textContent.trim();
        if (AR_TO_EN[raw]) {
          el.dataset.arText = el.textContent;
          el.textContent = AR_TO_EN[raw];
        } else if (raw.indexOf("ج.م.") !== -1 && raw.length < 30) {
          el.dataset.arText = el.textContent;
          el.textContent = raw.replace("ج.م.", "EGP").replace(/[٠-٩]/g, function (d) {
            return String("٠١٢٣٤٥٦٧٨٩".indexOf(d));
          });
        }
      } else {
        var ar = el.dataset.arText.trim();
        if (AR_TO_EN[ar]) el.textContent = AR_TO_EN[ar];
      }
    } else if (el.dataset.arText !== undefined) {
      el.textContent = el.dataset.arText;
    }
  }

  function applyLanguage(lang) {
    var html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "en" ? "ltr" : "rtl";

    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      toggleBtn.textContent = lang === "en" ? "عربي" : "EN";
    }

    // Translate leaf-like text elements safely
    var candidates = document.querySelectorAll("a, button, span, p, h1, h2, h3, h4, label, option, li, summary");
    candidates.forEach(function (el) {
      if (el.id === "lang-toggle" || el.id === "cart-count") return;
      if (el.children.length === 0) {
        translateNode(el, lang);
      }
    });

    // Translate input placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(function (inp) {
      if (lang === "en") {
        if (!inp.dataset.arPlaceholder) {
          inp.dataset.arPlaceholder = inp.getAttribute("placeholder") || "";
        }
        var enPh = PLACEHOLDERS_EN[inp.dataset.arPlaceholder];
        if (enPh) inp.setAttribute("placeholder", enPh);
      } else if (inp.dataset.arPlaceholder) {
        inp.setAttribute("placeholder", inp.dataset.arPlaceholder);
      }
    });
  }

  function init() {
    var current = "ar";
    try {
      current = localStorage.getItem("elhusseiny_lang") === "en" ? "en" : "ar";
    } catch (e) {}

    if (current === "en") {
      applyLanguage("en");
    }

    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var next = document.documentElement.lang === "en" ? "ar" : "en";
        try {
          localStorage.setItem("elhusseiny_lang", next);
        } catch (e) {}
        applyLanguage(next);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
