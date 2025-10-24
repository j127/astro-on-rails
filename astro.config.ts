// Astro server build configuration used by this repo.
// Key idea: we keep source views in app/views/** and generate server pages
// into generated/pages/views/** that simply import and render the source view
// with props coming from Rails (threaded via Astro.locals.rubyProps).
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import glob from "fast-glob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

// React is optional but enabled here to demonstrate React islands in Astro.
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  srcDir: "generated",
  integrations: [
    {
      name: "aor:views",
      hooks: {
        async "astro:config:setup"() {
          // referenceDir: source Astro views authored alongside Rails in app/views/**
          const referenceDir = new URL("app/views/", import.meta.url);
          // generatedDir: output folder where we place wrapper pages and types
          const generatedDir = new URL("generated/", import.meta.url);
          const pagesDir = new URL("pages/", generatedDir);
          const viewsDir = new URL("views/", pagesDir);
          // Discover all .astro views (excluding any nested pages/)
          const views = await glob(["**/*.astro", "!pages/**/*.astro"], {
            cwd: fileURLToPath(referenceDir),
            onlyFiles: true,
          });
          await mkdir(viewsDir, { recursive: true });
          for (const view of views) {
            const viewUrl = new URL(view, viewsDir);
            const viewRelativeToPage = path.relative(
              path.dirname(fileURLToPath(viewUrl)),
              fileURLToPath(new URL(view, referenceDir))
            );
            // For each source view, generate a server page that imports it and
            // passes props from Rails (set on Astro.locals.rubyProps by [...app].ts).
            const pageContent = `---
import View from ${JSON.stringify(viewRelativeToPage)};
const props = Astro.locals.rubyProps ?? {};
---

<View {...props} />`;

            await mkdir(path.dirname(fileURLToPath(viewUrl)), {
              recursive: true,
            });
            await writeFile(viewUrl, pageContent);
          }
          const envdtsUrl = new URL("env.d.ts", referenceDir);

          if (!existsSync(envdtsUrl)) {
            const generatedEnvdtsUrl = new URL("env.d.ts", generatedDir);
            const relativePath = path.relative(
              path.dirname(fileURLToPath(envdtsUrl)),
              fileURLToPath(generatedEnvdtsUrl)
            );
            // Ensure app/views/env.d.ts references generated/env.d.ts for DX.
            await writeFile(
              envdtsUrl,
              `/// <reference path=${JSON.stringify(relativePath)} />`
            );
          }

          // Copy the catch-all route into the generated pages folder so dev/build
          // can resolve it from srcDir = "generated".
          await writeFile(
            new URL("[...app].ts", pagesDir),
            await readFile(new URL("[...app].ts", import.meta.url), "utf-8")
          );
        },
      },
    },
    react(),
  ],
});
