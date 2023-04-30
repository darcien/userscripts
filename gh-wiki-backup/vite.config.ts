import { defineConfig } from "vite";
import Userscript from "vite-userscript-plugin";
import packageJson from "./package.json";

export default defineConfig((config) => {
  return {
    plugins: [
      Userscript({
        entry: "src/mod.ts",
        header: {
          name: "GitHub Wiki Backup",
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          // TODO: migrate to match to make script work when navigating from different pages
          match: [],
          // match: ["https://github.com/*"],
          include: [
            "/^https://github.com/.+/wiki/_new$/",
            "/^https://github.com/.+/wiki/.+/_edit$/",
          ],
          require: ["https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js"],
        },
        server: {
          port: 3000,
        },
      }),
    ],
  };
});
