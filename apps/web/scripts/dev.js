import { execSync, spawn } from "child_process";

const log = (color, icon, message) =>
  console.log(`${color}${icon} ${message}\x1b[0m`);

function checkDocker() {
  console.log("\n\x1b[1;36m══════════════════════════════════════\x1b[0m");
  console.log("\x1b[1;36m🚀 Starting Dev Environment Check... \x1b[0m");
  console.log("\x1b[1;36m══════════════════════════════════════\x1b[0m");

  try {
    execSync("docker info", { stdio: "ignore" });
    log("\x1b[32m", "✔", "Docker is running");
  } catch (error) {
    log("\x1b[31m", "✖", "Docker is NOT running. Please open Docker Desktop.");
    process.exit(1);
  }

  try {
    const infraExists = execSync(
      'docker ps -a --filter "name=infra" --format "{{.Names}}"'
    )
      .toString()
      .trim();
    if (!infraExists) {
      log("\x1b[31m", "✖", "'infra' container does not exist.");
      log(
        "\x1b[33m",
        "💡",
        "Ensure you have installed the Supabase CLI and run `supabase start` inside the infra folder."
      );
      process.exit(1);
    } else {
      log("\x1b[32m", "✔", "'infra' container exists");
    }
  } catch (error) {
    log(
      "\x1b[31m",
      "✖",
      "Failed to check 'infra' container. Make sure Docker is running."
    );
    process.exit(1);
  }
}

function displayLinks() {
  console.log("\n\x1b[1;34m══════════════════════════════════════\x1b[0m");
  console.log("\x1b[1;34m🔗 Useful Localhost Services:\x1b[0m");
  console.log("\x1b[1;34m══════════════════════════════════════\x1b[0m");

  console.log("➡ \x1b[36mApp:               \x1b[0m http://localhost:3000");
  console.log("➡ \x1b[36mSUPABASE DASHBOARD:\x1b[0m http://localhost:54323");
  console.log("➡ \x1b[36mEMAILS FOR AUTH:   \x1b[0m http://localhost:54324");
  console.log("\x1b[1;34m══════════════════════════════════════\x1b[0m\n");
}

// Run checks
checkDocker();
displayLinks();

// Run Next.js dev server with turbopack
console.log("\x1b[1;32m🚀 Starting Next.js Dev Server...\x1b[0m\n");
const devProcess = spawn("next", ["dev", "--turbopack"], {
  stdio: "inherit",
  shell: true,
});

devProcess.on("exit", (code) => {
  process.exit(code);
});
