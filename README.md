# README

This is a personal fork of [bholmesdev/astro-on-rails](https://github.com/bholmesdev/astro-on-rails) just for poking around at the code to see how it works. This code isn't meant to be used, except as an example to myself. I also added React to Astro to see if that would work, and it does.

---

This creates a Ruby on Rails project using Astro for views.

## Installation

First, follow the [Rails installation guide](https://guides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails) to ensure you have compatible versions of Ruby and Rails installed.

Once Ruby is set up, install packages / gems:

```bash
bundle install
```

Next, install JavaScript dependencies using the `bun` command:

```bash
bun install
```

Finally, create the database:

```bash
bin/rails db:prepare
```

## Start the development server

Run `bun dev` in your terminal. This will start the Astro dev server at `http://localhost:4321`, and a Ruby on Rails server in the background. Be sure to open `http://localhost:4321` and not the Rails server.

## How the Astro and Rails integration works

- Request flow:
	1. Browser hits the Astro dev server (port 4321).
	2. Astro catch‑all route (`[...app].ts`) proxies the request path to Rails at `http://localhost:3000`.
	3. If the Rails controller includes the `Astro` concern and does not render a template, the concern rescues `MissingExactTemplate`, sets `X-Astro-View` to `controller/action`, and renders controller instance variables as JSON props.
	4. `[...app].ts` checks for `X-Astro-View`, parses JSON props, assigns them to `ctx.locals.rubyProps`, and rewrites the request to `/views/controller/action`.
	5. Astro renders the page wrapper under `generated/pages/views/**` which imports the source view in `app/views/**` and passes `rubyProps` through to the component.

- Where pages come from:
	- `astro.config.ts` includes an integration (`aor:views`) that scans `app/views/**` and codegenerates thin wrapper pages into `generated/pages/views/**`.
	- It also copies the catch‑all route into `generated/pages/[...app].ts` and ensures `app/views/env.d.ts` references the generated types.

- Conventions:
	- Props are just your controller instance variables without the leading `@` (for example, `@title` becomes `title`).
	- Views map by path: controller and action map to `app/views/controller/action.astro`.
	- The catch‑all route uses a simple `.replace("index", "")` when rewriting, so index actions resolve to `/views/controller/`.

- Add a new page:
	- Add a Rails route and controller action; set the instance vars you need.
	- Create `app/views/controller/action.astro` using those props via `Astro.props`.
	- Visit the route through Astro (port 4321).

- Notes:
	- React islands are available via `@astrojs/react` already configured in `astro.config.ts`.
	- For production, consider swapping the hardcoded Rails URL in `[...app].ts` for an environment variable.

## Example: add a new page

Goal: render a simple About page with a title and message from Rails.

1) Add a route in `config/routes.rb`:

```ruby
get "/about", to: "pages#about"
```

2) Create a controller `app/controllers/pages_controller.rb`:

```ruby
class PagesController < ApplicationController
	include Astro

	def about
		@title = "About This Site"
		@message = "Built with Rails + Astro views."
	end
end
```

3) Create the Astro view at `app/views/pages/about.astro`:

```astro
---
import Layout from "../Layout.astro";

type Props = {
	title: string;
	message: string;
};

const { title, message } = Astro.props as Props;
---

<Layout>
	<h1>{title}</h1>
	<p>{message}</p>
	<p>
		<a href="/">Back to articles</a>
	</p>
</Layout>
```

4) Visit http://localhost:4321/about

What happens under the hood:
- `PagesController#about` sets instance vars. It does not render a template.
- The `Astro` concern rescues MissingExactTemplate, sets `X-Astro-View: pages/about`, and renders `{ title, message }` as JSON.
- Astro `[...app].ts` proxies, detects the header, attaches props to `Astro.locals.rubyProps`, and rewrites to `/views/pages/about`.
- The generated wrapper in `generated/pages/views/pages/about.astro` imports your view and spreads the props.
