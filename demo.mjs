import { createBlockchainIQTool } from "./index.mjs";
const t = createBlockchainIQTool();
const out = JSON.parse(await t.invoke({ resource: process.argv[2] || "brief" }));
console.log("status", out.status); console.log("settlement", JSON.stringify(out.settlement));
console.log(JSON.stringify(out.data).slice(0, 400));
