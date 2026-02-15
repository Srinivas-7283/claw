// Shim for Convex API to avoid cross-project TypeScript issues
// TODO: Fix monorepo structure to allow strict typing

export const api: any = new Proxy({}, {
    get: (target, prop) => {
        return new Proxy({}, {
            get: (t, p) => `${String(prop)}:${String(p)}`
        });
    }
});
