import { defineConfig } from "vite";
import Userscript from "vite-userscript-plugin";
import packageJson from "./package.json";

export default defineConfig((config) => {
  return {
    plugins: [
      Userscript({
        entry: "src/mod.ts",
        header: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          match: ["https://github.com/*"],
          require: ["https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js"],
        },
        server: {
          port: 3000,
        },
      }),
    ],
  };
});
