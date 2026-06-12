import * as fs from "fs/promises";
import * as path from "path";

interface SpecAxis {
  values: Record<string, string>;
  default: string;
}

interface ComponentSpec {
  name: string;
  htmlElement: string;
  baseClass: string;
  axes: Record<string, SpecAxis>;
  booleanModifiers: Record<string, string>;
  reactProps: string[];
}

const specsDir = path.join(__dirname, "specs");
const classesDir = path.join(__dirname, "../src/classes");
const componentsDir = path.join(__dirname, "../src/components");

async function run() {
  await fs.mkdir(classesDir, { recursive: true });

  const files = await fs.readdir(specsDir);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const specPath = path.join(specsDir, file);
    const specContent = await fs.readFile(specPath, "utf-8");
    const spec: ComponentSpec = JSON.parse(specContent);

    const componentNameLowerCase = spec.name.toLowerCase();

    // Generate Button.types.ts
    await generateTypes(spec, componentNameLowerCase);

    // Generate button.ts (classes)
    await generateClasses(spec, componentNameLowerCase);
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateTypes(spec: ComponentSpec, lowerName: string) {
  const typesFilePath = path.join(
    componentsDir,
    lowerName,
    `${spec.name}.types.ts`,
  );

  let typesContent = `// GENERATED FILE. DO NOT EDIT.\n`;
  typesContent += `import type { ComponentProps } from "react";\n\n`;

  for (const [axisName, axis] of Object.entries(spec.axes)) {
    const typeName = `${spec.name}${capitalize(axisName)}`;
    const values = Object.keys(axis.values)
      .map((v) => `"${v}"`)
      .join(" | ");
    typesContent += `export type ${typeName} = ${values};\n\n`;
  }

  typesContent += `export interface ${spec.name}Props extends ComponentProps<"${spec.htmlElement}"> {\n`;
  for (const [axisName] of Object.entries(spec.axes)) {
    const typeName = `${spec.name}${capitalize(axisName)}`;
    typesContent += `  ${axisName}?: ${typeName};\n`;
  }
  for (const mod of Object.keys(spec.booleanModifiers)) {
    typesContent += `  ${mod}?: boolean;\n`;
  }
  for (const prop of spec.reactProps) {
    typesContent += `  ${prop};\n`;
  }
  typesContent += `}\n`;

  await fs.mkdir(path.dirname(typesFilePath), { recursive: true });
  await fs.writeFile(typesFilePath, typesContent);
  console.log(`Generated ${typesFilePath}`);
}

async function generateClasses(spec: ComponentSpec, lowerName: string) {
  const classesFilePath = path.join(classesDir, `${lowerName}.ts`);

  let classesContent = `// GENERATED FILE. DO NOT EDIT.\n`;
  classesContent += `import { cn } from "../utils";\n`;

  const importedTypes = Object.keys(spec.axes).map(
    (axisName) => `${spec.name}${capitalize(axisName)}`,
  );
  classesContent += `import type { ${importedTypes.join(", ")} } from "../components/${lowerName}/${spec.name}.types";\n\n`;

  classesContent += `export const ${lowerName}BaseClass = "${spec.baseClass}";\n\n`;

  for (const [axisName, axis] of Object.entries(spec.axes)) {
    const typeName = `${spec.name}${capitalize(axisName)}`;
    const mapName = `${lowerName}${capitalize(axisName)}Classes`;
    classesContent += `export const ${mapName}: Record<${typeName}, string> = {\n`;
    for (const [valName, valClass] of Object.entries(axis.values)) {
      classesContent += `  ${valName}: "${valClass}",\n`;
    }
    classesContent += `};\n\n`;
  }

  for (const [mod, cls] of Object.entries(spec.booleanModifiers)) {
    const mapName = `${lowerName}${capitalize(mod)}Class`;
    classesContent += `export const ${mapName} = "${cls}";\n`;
  }
  classesContent += `\n`;

  // getButtonClasses
  classesContent += `export function get${spec.name}Classes({\n`;
  for (const axisName of Object.keys(spec.axes)) {
    classesContent += `  ${axisName} = "${spec.axes[axisName].default}",\n`;
  }
  for (const mod of Object.keys(spec.booleanModifiers)) {
    classesContent += `  ${mod},\n`;
  }
  classesContent += `  className,\n`;
  classesContent += `}: {\n`;
  for (const axisName of Object.keys(spec.axes)) {
    const typeName = `${spec.name}${capitalize(axisName)}`;
    classesContent += `  ${axisName}?: ${typeName};\n`;
  }
  for (const mod of Object.keys(spec.booleanModifiers)) {
    classesContent += `  ${mod}?: boolean;\n`;
  }
  classesContent += `  className?: string;\n`;
  classesContent += `}) {\n`;
  classesContent += `  return cn(\n`;
  classesContent += `    ${lowerName}BaseClass,\n`;
  for (const axisName of Object.keys(spec.axes)) {
    const mapName = `${lowerName}${capitalize(axisName)}Classes`;
    classesContent += `    ${mapName}[${axisName}],\n`;
  }
  for (const mod of Object.keys(spec.booleanModifiers)) {
    const mapName = `${lowerName}${capitalize(mod)}Class`;
    classesContent += `    ${mod} && ${mapName},\n`;
  }
  classesContent += `    className\n`;
  classesContent += `  );\n`;
  classesContent += `}\n`;

  await fs.mkdir(path.dirname(classesFilePath), { recursive: true });
  await fs.writeFile(classesFilePath, classesContent);
  console.log(`Generated ${classesFilePath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
