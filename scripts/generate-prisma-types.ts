const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(__dirname, "../electron/prisma/schema.prisma");
const outputDir = path.resolve(__dirname, "../renderer/src/types");
const outputPath = path.join(outputDir, "prisma.ts");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const schema = fs.readFileSync(schemaPath, "utf-8");

// Match model blocks
const modelRegex = /model (\w+) {([\s\S]*?)}/g;

// Collect model names first (to detect relations)
const modelNames = Array.from(schema.matchAll(/model (\w+) {/g)).map(
  (m: any) => m[1]
);

const prismaToTs = (type: string) =>
  type
    .replace("String", "string")
    .replace("Int", "number")
    .replace("Float", "number")
    .replace("Boolean", "boolean")
    .replace("DateTime", "string");

let output = "// AUTO-GENERATED TYPES FROM PRISMA SCHEMA\n\n";

let match;
while ((match = modelRegex.exec(schema)) !== null) {
  const modelName = match[1];
  const lines = match[2].trim().split("\n");

  output += `export type ${modelName} = {\n`;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("//") || line.startsWith("@@")) continue;

    const [field, rawType] = line.split(/\s+/);
    if (!field || !rawType) continue;

    const isOptional = rawType.endsWith("?");
    const isArray = rawType.includes("[]");

    let baseType = rawType.replace("?", "").replace("[]", "");

    const isRelation = modelNames.includes(baseType);

    let tsType = prismaToTs(baseType);
    if (isArray) tsType += "[]";

    // Apply rules
    if (isOptional) {
      if (isArray || isRelation) {
        // optional relation or array → no | null
        output += `  ${field}?: ${tsType};\n`;
      } else {
        // optional scalar → | null
        output += `  ${field}?: ${tsType} | null;\n`;
      }
    } else {
      output += `  ${field}: ${tsType};\n`;
    }
  }

  output += "};\n\n";
}

fs.writeFileSync(outputPath, output);

console.log(`✅ TypeScript types generated at ${outputPath}`);
