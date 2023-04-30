import packageJson from "../package.json" assert { type: "json" };

// Our vite plugin builds the file using name from package.json
const userscriptName = packageJson.name;
// We want to use user friendly name for userscript name
// but the userscript vite plugin reuse name
// for file and userscript name.
const userFriendlyName = "GitHub Wiki Backup";

// The built file we want to patch
const filesToPatch = [
  `${userscriptName}.meta.js`,
  `${userscriptName}.user.js`,
];

for (const fileName of filesToPatch) {
  const pathToFile = `./dist/${fileName}`;
  const unpatched = await Deno.readTextFile(pathToFile);

  const patched = unpatched.split("\n").map((line) => {
    if (line && line.startsWith(`// @name`) && line.endsWith(userscriptName)) {
      return line.replace(userscriptName, userFriendlyName);
    } else {
      return line;
    }
  }).join("\n");

  await Deno.writeTextFile(pathToFile, patched);
}
