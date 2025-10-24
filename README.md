# README

This is a personal fork of [bholmesdev/astro-on-rails](https://github.com/bholmesdev/astro-on-rails) just for poking around at the code to see how it works.

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

Run `pnpm dev` in your terminal. This will start the Astro dev server at `http://localhost:4321`, and a Ruby on Rails server in the background. Be sure to open `http://localhost:4321` and _not_ the Rails server.
