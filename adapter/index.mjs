// Minimal custom adapter used by the alternate dev config (_astro.config.ts).
// Demonstrates how to set a server entrypoint and advertise supported features.
/** @returns {import('astro').AstroIntegration} */
export default function () {
  return {
    name: "my-adapter",
    hooks: {
      "astro:config:done": ({ setAdapter }) => {
        setAdapter({
          name: "my-adapter",
          serverEntrypoint: new URL("./server-entrypoint.mjs", import.meta.url)
            .pathname,
          supportedAstroFeatures: {
            serverOutput: "stable",
          },
          exports: ["manifest"],
        });
      },
      "astro:build:setup": ({ vite, target }) => {
        if (target === "server") {
          vite.build.rollupOptions.input.push("src/all.ts");
        }
      },
    },
  };
}
