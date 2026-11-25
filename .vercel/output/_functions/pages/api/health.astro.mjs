export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  return Response.json({
    ok: true,
    service: "elhusseiny-shop",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
