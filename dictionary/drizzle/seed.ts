import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  console.log("⏳ Reading JSON file...");
  const filePath = path.join(__dirname, "angular_dump.json");
  const rawData = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(rawData).filter(
    (item: any) => item.english_term && item.runyoro_term
  );

  console.log(`🚀 Preparing SQL for ${jsonData.length} entries...`);

  const sqlStatements = [];

  // Batch inserts
  const BATCH_SIZE = 50; // Smaller batch size for SQL file readability/safety
  for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
    const batch = jsonData.slice(i, i + BATCH_SIZE);
    const values = batch
      .map((item: any) => {
        const escape = (str: string | null) =>
          str ? `'${str.replace(/'/g, "''")}'` : "NULL";
        return `(${escape(item.english_term)}, ${escape(
          item.runyoro_term
        )}, ${escape(item.swahili_term)}, ${escape(item.examples)}, ${escape(
          item.image
        )}, ${escape(item.audio)})`;
      })
      .join(",\n");

    sqlStatements.push(
      `INSERT INTO dictionary_entries (english_term, runyoro_term, swahili_term, examples, image, audio) VALUES ${values};`
    );
  }

  const outputPath = path.join(__dirname, "seed.sql");
  fs.writeFileSync(outputPath, sqlStatements.join("\n\n"));

  console.log(`✅ SQL file generated at ${outputPath}`);
  console.log("Run the following command to seed your D1 database:");
  console.log(
    "  npx wrangler d1 execute dictionary-db --local --file=drizzle/seed.sql"
  );
  console.log("  (Remove --local to seed remote production DB)");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
