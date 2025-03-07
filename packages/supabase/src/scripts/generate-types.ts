// packages/supabase/scripts/generate-types.ts
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables from apps/web/.env
config({ path: join(__dirname, "../../../../apps/web/.env") });

// Paths
const OUTPUT_FILE = join(__dirname, "../lib/types/database.types.ts");

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in apps/web/.env.",
  );
}

/**
 * Generate types using Supabase CLI
 */
function generateTypes() {
  try {
    console.log("📦 Generating Supabase types...");

    // Use the --local flag for local Supabase
    const types = execSync(
      `npx supabase gen types typescript --local --schema public`,
      {
        cwd: join(__dirname, "../../../../infra/supabase"),
        env: {
          ...process.env,
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
        },
      },
    ).toString();

    // Save the generated types to the output file
    writeFileSync(OUTPUT_FILE, types);

    console.log(`✅ Types successfully generated and saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Type generation failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
generateTypes();
