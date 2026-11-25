import{g as i,u as g,r as f,s as u,b as p}from"./cart.iujg18Hi.js";import{e as a,s as v,f as c}from"./sanitize.PcCcJw86.js";const y=document.getElementById("cart-empty"),x=document.getElementById("cart-content"),l=document.getElementById("cart-items"),b=document.getElementById("cart-total");function r(){const e=i();if(u(e),!e.length){y?.classList.remove("hidden"),x?.classList.add("hidden");return}y?.classList.add("hidden"),x?.classList.remove("hidden"),l&&(l.innerHTML=e.map(t=>`
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5" data-cart-row="${a(t.id)}">
            <div class="flex items-center gap-4">
              <img
                src="${v(t.image_url)}"
                alt="${a(t.name)}"
                width="72"
                height="72"
                class="h-18 w-18 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0"
              />
              <div>
                <a href="/products/${encodeURIComponent(t.slug)}" class="text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400">
                  ${a(t.name)}
                </a>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${c(t.price)}</p>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-4">
              <div class="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  data-qty-dec="${a(t.id)}"
                  aria-label="تقليل الكمية"
                  class="px-3 py-1.5 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >−</button>
                <span class="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white">${t.quantity}</span>
                <button
                  type="button"
                  data-qty-inc="${a(t.id)}"
                  aria-label="زيادة الكمية"
                  class="px-3 py-1.5 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >+</button>
              </div>

              <span class="text-sm sm:text-base font-bold text-gray-900 dark:text-white min-w-20 text-left">
                ${c(t.price*t.quantity)}
              </span>

              <button
                type="button"
                data-remove-item="${a(t.id)}"
                class="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        `).join("")),b&&(b.textContent=c(p(e)))}l?.addEventListener("click",e=>{const t=e.target,d=t?.closest("[data-qty-inc]")?.dataset.qtyInc,n=t?.closest("[data-qty-dec]")?.dataset.qtyDec,m=t?.closest("[data-remove-item]")?.dataset.removeItem;if(d){const s=i().find(o=>o.id===d);s&&g(d,s.quantity+1),r()}else if(n){const s=i().find(o=>o.id===n);s&&g(n,s.quantity-1),r()}else m&&(f(m),r())});r();
