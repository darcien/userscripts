import { defineConfig } from "vite";
import Userscript from "@darcien/vite-userscript-plugin";
import packageJson from "./package.json";

export default defineConfig((_config) => {
  return {
    plugins: [
      Userscript({
        entry: "src/mod.ts",
        fileName: packageJson.name,
        header: {
          name: "GitHub Wiki Backup",
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          match: ["https://github.com/*"],
          require: ["https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js"],
          homepageURL:
            "https://github.com/darcien/userscripts/tree/master/gh-wiki-backup",
          downloadURL:
            "https://github.com/darcien/userscripts/raw/master/gh-wiki-backup/dist/gh-wiki-backup.user.js",
        },
        server: {
          port: 3000,
        },
      }),
    ],
  };
});
