(function () {
  var grid = document.getElementById("products-grid");
  var searchInput = document.getElementById("product-search");
  var sortSelect = document.getElementById("product-sort");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-product-card]"));
  var emptyState = document.getElementById("empty-results");
  var resetBtn = document.getElementById("reset-filters");
  var resultsCount = document.getElementById("results-count");

  cards.forEach(function (c, idx) {
    c.dataset.origOrder = String(idx);
  });

  var params = new URLSearchParams(window.location.search);
  var activeCategory = params.get("category") || "all";
  var initialQuery = params.get("q") || "";
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  function normalizeArabic(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .trim();
  }

  function updateFilterStyles() {
    filterButtons.forEach(function (btn) {
      var isSelected = btn.dataset.filterCategory === activeCategory;
      btn.className = isSelected
        ? "filter-btn inline-flex items-center gap-1.5 rounded-full bg-emerald-800 px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors"
        : "filter-btn inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-700 transition-colors";
    });
  }

  function applySort() {
    if (!grid) return;
    var mode = sortSelect ? sortSelect.value : "default";
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === "price-asc") return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
      if (mode === "price-desc") return Number(b.dataset.price || 0) - Number(a.dataset.price || 0);
      if (mode === "name-asc") return (a.dataset.name || "").localeCompare(b.dataset.name || "", "ar");
      return Number(a.dataset.origOrder || 0) - Number(b.dataset.origOrder || 0);
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    var query = normalizeArabic(searchInput ? searchInput.value : "");
    var words = query ? query.split(/\s+/) : [];
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardCat = card.dataset.categorySlug || "";
      var cardText = normalizeArabic(card.dataset.searchText || "");

      var matchesCategory = activeCategory === "all" || cardCat === activeCategory;
      var matchesSearch = !words.length || words.every(function (word) {
        return cardText.indexOf(word) !== -1;
      });

      var show = matchesCategory && matchesSearch;
      card.classList.toggle("hidden", !show);
      if (show) visibleCount++;
    });

    if (resultsCount) {
      resultsCount.textContent = "عرض " + visibleCount + " منتج";
    }
    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount > 0);
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeCategory = btn.dataset.filterCategory || "all";
      updateFilterStyles();
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applySort();
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      activeCategory = "all";
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "default";
      updateFilterStyles();
      applySort();
      applyFilters();
    });
  }

  updateFilterStyles();
  applyFilters();
})();
