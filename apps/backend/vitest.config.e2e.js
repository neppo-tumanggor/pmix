import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
    plugins: [tsconfigPaths()],
});
