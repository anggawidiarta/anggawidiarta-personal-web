import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    overrides: [
      {
        files: ["src/env.d.ts"],
        rules: { "typescript/triple-slash-reference": "off" },
      },
    ],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    printWidth: 100,
    sortPackageJson: false,
    sortTailwindcss: {},
    ignorePatterns: [],
  },
});
