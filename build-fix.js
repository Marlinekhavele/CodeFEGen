const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Run the Next.js build
console.log("Running Next.js build...")
execSync("next build", { stdio: "inherit" })

// Check if the .next/static/css directory exists
const cssDir = path.join(process.cwd(), ".next", "static", "css")
if (!fs.existsSync(cssDir)) {
  console.log("No CSS directory found. Creating one...")
  fs.mkdirSync(cssDir, { recursive: true })
}

console.log("Build completed with CSS fix applied.")
