import { defineConfig } from "vite";
import Userscript from "@darcien/vite-userscript-plugin";
import packageJson from "./package.json";

export default defineConfig((_config) => {
  return {
    // See `Userscript.jsEsbuildTransformOptions.minify` instead.
    // build: { minify: false },
    plugins: [
      Userscript({
        entry: "src/mod.ts",
        fileName: packageJson.name,
        header: {
          name: "Disable disablepictureinpicture",
          version: packageJson.version,
          description: packageJson.description,
          author: packageJson.author,
          match: ["https://nicochannel.jp/*", "https://qlover.jp/*"],
          // The prototype patch reaches the page code only in the page context.
          // The default `auto` falls back to a content script
          // when CSP blocks the page context.
          "inject-into": "page",
          homepageURL:
            "https://github.com/darcien/userscripts/tree/master/disable-disablepictureinpicture",
          downloadURL:
            "https://github.com/darcien/userscripts/raw/master/disable-disablepictureinpicture/dist/disable-disablepictureinpicture.user.js",
        },
        jsEsbuildTransformOptions: {
          // Only minify syntax and whitespace
          // to avoid obfuscating the userscript.
          minify: false,
          minifySyntax: true,
          minifyWhitespace: true,
          // minifyIdentifiers: true,
        },
        server: {
          port: 3000,
        },
      }),
    ],
  };
});
