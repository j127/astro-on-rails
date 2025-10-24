# Copilot instructions for astro-on-rails

Project-specific guidance to make AI coding agents productive here.

## Big picture

- Rails is the backend (models/controllers/routes). Astro is the view layer rendered by a Node server in dev on port 4321.
- All requests go to Astro first. The catch‑all route `[...app].ts` proxies to Rails at `http://localhost:3000` and inspects the response.
- If Rails sets `X-Astro-View`, Astro rewrites to an Astro page for that view and injects controller instance variables as props.
- Data flow:
  1. Browser → Astro (4321)
  2. Astro `[...app].ts` → Rails (3000)
  3. Rails `Astro` concern sets header + JSON props
  4. Astro rewrites to `/views/<controller>/<action>` and renders `app/views/**.astro` with props

## Key files

- `astro.config.ts`: Active codegen config using `@astrojs/node` with `output: server` and `srcDir: generated`. Integration `aor:views` scans `app/views/**`, generates wrapper pages in `generated/pages/views/**` that import the source views, writes an `env.d.ts` reference if missing, and copies the catch‑all route into `generated/pages/[...app].ts`.
- `_astro.config.ts`: Alternate dev config showing a custom adapter in `adapter/` plus an `aor:dev` middleware that can render `app/views/<view>.astro` directly using query params (view, props) during dev.
- `[...app].ts`: Catch‑all proxy that forwards to Rails, extracts JSON props, sets `ctx.locals.rubyProps`, and rewrites to the target view path.
- `app/controllers/concerns/astro.rb`: On `MissingExactTemplate`, collects controller instance variables → JSON props and sets `X-Astro-View`.
- `app/views/**`: Source `.astro` views. Examples: `articles/index.astro`, `articles/show.astro`. `Layout.astro` is the shared shell.
- `config/routes.rb`: Rails routes (examples: root maps to articles index; GET /articles; GET /articles/:id).

## Dev workflow

- Install: `bundle install` → `bun install` → `bin/rails db:prepare`.
- Run: `bun dev` (starts Astro and Rails; see package.json scripts). Open http://localhost:4321.
- Rails runs at http://localhost:3000 by default. Astro proxies to this host, but you can override it via `RAILS_URL`.
 - Optional: React is enabled via `@astrojs/react` in `astro.config.ts`.
 - Config: You can override the Rails target via `RAILS_URL` (e.g., `RAILS_URL=https://api.example.com`).

## How rendering works (example)

- Controller action sets instance vars; don’t render a template with the same name (let `MissingExactTemplate` trigger the concern).
- Concern sets header X-Astro-View: controller/action and returns JSON props derived from instance vars.
- Astro view at app/views/controller/action.astro reads them from Astro.props.
- Note: `[...app].ts` rewrites to `/views/` plus the view value, with a simple `.replace("index", "")`. For an index action, that yields `/views/controller/`.

## Add a new page

- Add a Rails route and controller action; set the instance vars you need.
- Create app/views/controller/action.astro using those props.
- Visit the route through Astro (port 4321) to see the rendered page.

## Conventions

- Props are controller instance vars without the @ (example: @title becomes title).
- Mapping: controller and action map to app/views/controller/action.astro.
- If `X-Astro-View` is missing, Astro returns the Rails response unchanged (useful for non-Astro endpoints and assets).

## Two configs note

- Active config is `astro.config.ts` (node adapter + codegen to generated/). `_astro.config.ts` is an alternate setup demonstrating a custom adapter and dev middleware.
- Prefer the `[...app].ts` + `concerns/astro.rb` flow when adding view routes and props; it matches the current architecture and examples.

## Commands

- `bun dev` — start Astro (4321) + Rails (3000)
- `bun run build` — Astro server build
- `bin/rails test` — Rails tests

## Gotchas

- Don’t add an ERB template with the same name as your Astro view; let the concern handle JSON + header.
- Props parsing in `[...app].ts` only activates for `Content-Type: application/json`.
- For production, replace the hardcoded Rails URL in `[...app].ts` with an env var.
