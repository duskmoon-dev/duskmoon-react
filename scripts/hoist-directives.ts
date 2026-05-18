import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';

async function hoistDirectives() {
  // Use absolute path or relative to project root
  const rootDir = process.env.PROJECT_ROOT || path.join(__dirname, '..');
  const pattern = path.join(rootDir, 'packages/components/dist/**/*.js');
  console.log(`Scanning for files matching: ${pattern}`);
  const files = await glob(pattern);

  console.log(`Found ${files.length} files`);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');

    if (content.includes('"use client"') || content.includes("'use client'")) {
      console.log(`Hoisting "use client" in ${file}`);
      // Remove all occurrences and put one at the top
      const cleanContent = content.replace(/['"]use client['"];?\s*/g, '');
      const newContent = `"use client";\n${cleanContent}`;
      await fs.writeFile(file, newContent);
    } else if (content.includes('"use server"') || content.includes("'use server'")) {
      console.log(`Hoisting "use server" in ${file}`);
      const cleanContent = content.replace(/['"]use server['"];?\s*/g, '');
      const newContent = `"use server";\n${cleanContent}`;
      await fs.writeFile(file, newContent);
    }
  }
}

hoistDirectives().catch(console.error);
