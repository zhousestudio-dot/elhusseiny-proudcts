import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BeijL-EM.mjs';
import { manifest } from './manifest_BmLRnpyI.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/admin-api.astro.mjs');
const _page3 = () => import('./pages/api/create-checkout.astro.mjs');
const _page4 = () => import('./pages/api/health.astro.mjs');
const _page5 = () => import('./pages/api/paymob-webhook.astro.mjs');
const _page6 = () => import('./pages/api/validate-cart.astro.mjs');
const _page7 = () => import('./pages/cart.astro.mjs');
const _page8 = () => import('./pages/checkout.astro.mjs');
const _page9 = () => import('./pages/payment/complete.astro.mjs');
const _page10 = () => import('./pages/products/_slug_.astro.mjs');
const _page11 = () => import('./pages/products.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/admin-api.ts", _page2],
    ["src/pages/api/create-checkout.ts", _page3],
    ["src/pages/api/health.ts", _page4],
    ["src/pages/api/paymob-webhook.ts", _page5],
    ["src/pages/api/validate-cart.ts", _page6],
    ["src/pages/cart.astro", _page7],
    ["src/pages/checkout.astro", _page8],
    ["src/pages/payment/complete.astro", _page9],
    ["src/pages/products/[slug].astro", _page10],
    ["src/pages/products/index.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "abffec9d-d83d-46be-8bd5-9aa41639ec07",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
