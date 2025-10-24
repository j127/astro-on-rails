// Adapter server entrypoint: Astro will call createExports(manifest)
// so the adapter can hand back any needed exports to the runtime.
export function createExports(manifest) {
  return { manifest };
}
