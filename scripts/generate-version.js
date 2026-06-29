import { writeFileSync } from "fs";
const version = Date.now().toString();
writeFileSync("public/version.json", JSON.stringify({ version }));
console.log("Version file generated:", version);
