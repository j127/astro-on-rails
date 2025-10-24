// Catch-all Astro endpoint that proxies to Rails and rewrites to Astro views.
// Flow:
// 1) Receive any request to Astro (dev server on 4321).
// 2) Forward to Rails at http://localhost:3000 (path preserved, headers forwarded).
// 3) If Rails sets X-Astro-View and returns JSON, parse props.
// 4) Save props to Astro.locals.rubyProps and rewrite to /views/<controller>/<action>.
//    Note: simple replace("index", "") means index actions rewrite to /views/<controller>/.
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  // Prefer an environment variable in production; default to local Rails.
  // Example: RAILS_URL="https://my-rails.example.com" bun dev
  const railsBase = process.env.RAILS_URL || "http://localhost:3000";
  const rubyResponse = await fetch(
    new URL(ctx.url.pathname, railsBase),
    { headers: ctx.request.headers }
  );
  const view = rubyResponse.headers.get("X-Astro-View");
  if (!view) {
    // Not an Astro-handled endpoint; return the Rails response as-is
    return rubyResponse;
  }
  let props = {};
  const contentType = rubyResponse.headers.get("Content-Type");
  const baseType = contentType?.split(";")?.[0]?.toLowerCase();
  if (baseType === "application/json") {
    // Controller concern renders JSON props derived from instance vars
    props = await rubyResponse.json();
  }

  const rewriteUrl = new URL(
    "/views/" + view.replace("index", ""),
    ctx.url.origin
  );
  (ctx.locals as any).rubyProps = props;
  return ctx.rewrite(rewriteUrl);
};
