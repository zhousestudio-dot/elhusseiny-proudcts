import 'piccolore';
import { q as decodeKey } from './chunks/astro/server_DxvtWgIK.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_CQt7rm47.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/","cacheDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/node_modules/.astro/","outDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/dist/","srcDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/src/","publicDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/public/","buildClientDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/dist/client/","buildServerDir":"file:///C:/Users/IBN%20DEV/Desktop/elhusseiny%20project/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"admin/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"cart/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/cart","isIndex":false,"type":"page","pattern":"^\\/cart\\/?$","segments":[[{"content":"cart","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/cart.astro","pathname":"/cart","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"checkout/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/checkout","isIndex":false,"type":"page","pattern":"^\\/checkout\\/?$","segments":[[{"content":"checkout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/checkout.astro","pathname":"/checkout","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"payment/complete/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/payment/complete","isIndex":false,"type":"page","pattern":"^\\/payment\\/complete\\/?$","segments":[[{"content":"payment","dynamic":false,"spread":false}],[{"content":"complete","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/payment/complete.astro","pathname":"/payment/complete","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"products/index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/products","isIndex":true,"type":"page","pattern":"^\\/products\\/?$","segments":[[{"content":"products","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/products/index.astro","pathname":"/products","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.COMknBZ6.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin-api","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin-api\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin-api","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin-api.ts","pathname":"/api/admin-api","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/create-checkout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/create-checkout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"create-checkout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/create-checkout.ts","pathname":"/api/create-checkout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/health","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/health\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"health","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/health.ts","pathname":"/api/health","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/paymob-webhook","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/paymob-webhook\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"paymob-webhook","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/paymob-webhook.ts","pathname":"/api/paymob-webhook","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/validate-cart","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/validate-cart\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"validate-cart","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/validate-cart.ts","pathname":"/api/validate-cart","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/admin.astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/cart.astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/checkout.astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/payment/complete.astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/products/[slug].astro",{"propagation":"none","containsHead":true}],["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/products/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/admin-api@_@ts":"pages/api/admin-api.astro.mjs","\u0000@astro-page:src/pages/api/create-checkout@_@ts":"pages/api/create-checkout.astro.mjs","\u0000@astro-page:src/pages/api/health@_@ts":"pages/api/health.astro.mjs","\u0000@astro-page:src/pages/api/paymob-webhook@_@ts":"pages/api/paymob-webhook.astro.mjs","\u0000@astro-page:src/pages/api/validate-cart@_@ts":"pages/api/validate-cart.astro.mjs","\u0000@astro-page:src/pages/cart@_@astro":"pages/cart.astro.mjs","\u0000@astro-page:src/pages/checkout@_@astro":"pages/checkout.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:src/pages/payment/complete@_@astro":"pages/payment/complete.astro.mjs","\u0000@astro-page:src/pages/products/[slug]@_@astro":"pages/products/_slug_.astro.mjs","\u0000@astro-page:src/pages/products/index@_@astro":"pages/products.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BmLRnpyI.mjs","C:/Users/IBN DEV/Desktop/elhusseiny project/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_C-EpnB8e.mjs","C:/Users/IBN DEV/Desktop/elhusseiny project/src/components/CartConnector.astro?astro&type=script&index=0&lang.ts":"_astro/CartConnector.astro_astro_type_script_index_0_lang.B41aKEmA.js","C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/admin.astro?astro&type=script&index=0&lang.ts":"_astro/admin.astro_astro_type_script_index_0_lang.DdO7WB7u.js","C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/cart.astro?astro&type=script&index=0&lang.ts":"_astro/cart.astro_astro_type_script_index_0_lang.azU0qygT.js","C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/checkout.astro?astro&type=script&index=0&lang.ts":"_astro/checkout.astro_astro_type_script_index_0_lang.Cw-itNqX.js","C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/payment/complete.astro?astro&type=script&index=0&lang.ts":"_astro/complete.astro_astro_type_script_index_0_lang.BMZ4xb2L.js","C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/products/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang._2fr2PdL.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/IBN DEV/Desktop/elhusseiny project/src/pages/products/index.astro?astro&type=script&index=0&lang.ts","const a=document.getElementById(\"product-search\"),l=Array.from(document.querySelectorAll(\"[data-filter-category]\")),y=Array.from(document.querySelectorAll(\"[data-product-card]\")),g=document.getElementById(\"empty-results\"),f=document.getElementById(\"reset-filters\"),h=new URLSearchParams(window.location.search);let e=h.get(\"category\")||\"all\";function n(){for(const t of l){const r=t.dataset.filterCategory===e;t.className=r?\"filter-btn rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white transition-colors\":\"filter-btn rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-600 transition-colors\"}}function o(){const t=(a?.value||\"\").trim().toLowerCase();let r=0;for(const s of y){const d=s.dataset.categorySlug||\"\",i=s.dataset.searchText||\"\",u=e===\"all\"||d===e,m=!t||i.includes(t),c=u&&m;s.classList.toggle(\"hidden\",!c),c&&r++}g?.classList.toggle(\"hidden\",r>0)}for(const t of l)t.addEventListener(\"click\",()=>{e=t.dataset.filterCategory||\"all\",n(),o()});a?.addEventListener(\"input\",o);f?.addEventListener(\"click\",()=>{e=\"all\",a&&(a.value=\"\"),n(),o()});n();o();"]],"assets":["/_astro/cairo-arabic-600-normal.rkrvveqO.woff2","/_astro/cairo-latin-ext-600-normal.DuRnqffh.woff2","/_astro/cairo-latin-700-normal.C3GYtKbV.woff2","/_astro/cairo-arabic-700-normal.D3nDedWX.woff2","/_astro/cairo-latin-ext-700-normal.Cscux539.woff2","/_astro/cairo-latin-ext-400-normal.xCL67Y2R.woff2","/_astro/cairo-latin-400-normal.Dh7otpdh.woff2","/_astro/cairo-latin-600-normal.mGS0uvCM.woff2","/_astro/cairo-arabic-400-normal.DN15VWMM.woff2","/_astro/cairo-latin-700-normal.6fcUy4Rc.woff","/_astro/cairo-arabic-600-normal.B3EOalmC.woff","/_astro/cairo-latin-ext-600-normal.DAfLYaOC.woff","/_astro/cairo-arabic-700-normal.CyOqhaeK.woff","/_astro/cairo-latin-ext-700-normal.htXca11Z.woff","/_astro/cairo-latin-400-normal.b1R3q6Pf.woff","/_astro/cairo-latin-600-normal.buYOP1M3.woff","/_astro/cairo-latin-ext-400-normal.C_BIE9Qe.woff","/_astro/cairo-arabic-400-normal.CAYwymWN.woff","/_astro/admin.COMknBZ6.css","/images/hero.svg","/images/prod-1.svg","/images/prod-2.svg","/images/prod-3.svg","/images/prod-4.svg","/_astro/admin.astro_astro_type_script_index_0_lang.DdO7WB7u.js","/_astro/cart.astro_astro_type_script_index_0_lang.azU0qygT.js","/_astro/cart.iujg18Hi.js","/_astro/CartConnector.astro_astro_type_script_index_0_lang.B41aKEmA.js","/_astro/checkout.astro_astro_type_script_index_0_lang.Cw-itNqX.js","/_astro/complete.astro_astro_type_script_index_0_lang.BMZ4xb2L.js","/_astro/sanitize.PcCcJw86.js","/images/products/product-01.jpg","/images/products/product-02.jpg","/images/products/product-03.jpg","/images/products/product-04.jpg","/images/products/product-05.jpg","/images/products/product-06.jpg","/images/products/product-07.jpg","/images/products/product-08.jpg","/images/products/product-09.jpg","/images/products/product-10.jpg","/images/products/product-11.jpg","/images/products/product-12.jpg","/images/products/product-13.jpg","/images/products/product-14.jpg","/images/products/product-15.jpg","/images/products/product-16.jpg","/images/products/product-17.jpg","/images/products/product-18.jpg","/images/products/product-19.jpg","/images/products/product-20.jpg","/images/products/product-21.jpg","/images/products/product-22.jpg","/images/products/product-23.jpg","/images/products/product-24.jpg","/images/products/product-25.jpg","/images/products/product-26.jpg","/images/products/product-27.jpg","/images/products/product-28.jpg","/images/products/product-29.jpg","/images/products/product-30.jpg","/images/products/product-31.jpg","/images/products/product-32.jpg","/admin/index.html","/cart/index.html","/checkout/index.html","/payment/complete/index.html","/products/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"i90AbGneKMWFL6ZY16EUr9rBCe46+K+lDEjAgJdJxSA="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
