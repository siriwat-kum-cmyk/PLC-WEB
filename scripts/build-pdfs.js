const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

// Candidates for headless browser
const BROWSER_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function generatePdf(browserPath, inputHtml, outputPdf) {
  console.log(`\n⏳ Generating PDF from: ${path.basename(inputHtml)}`);
  console.log(`   Output: ${path.basename(outputPdf)}`);

  const fileUrl = `file:///${inputHtml.replace(/\\/g, "/")}`;

  const args = [
    "--headless",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--enable-local-file-accesses",
    "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer",
    `--print-to-pdf=${outputPdf}`,
    fileUrl,
  ];

  try {
    execFileSync(browserPath, args, { stdio: "pipe", timeout: 30000 });
    if (fs.existsSync(outputPdf)) {
      const stats = fs.statSync(outputPdf);
      console.log(`✅ Success! Generated ${path.basename(outputPdf)} (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.error(`❌ PDF file not found at: ${outputPdf}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error generating PDF:`, err.message);
    return false;
  }
}

async function main() {
  const browserPath = findBrowser();
  if (!browserPath) {
    console.error("❌ No supported browser (Edge or Chrome) found.");
    process.exit(1);
  }
  console.log(`🌐 Using Browser engine: ${browserPath}`);

  const userManualHtml = path.join(DOCS_DIR, "user-manual-template.html");
  const userManualPdf = path.join(DOCS_DIR, "User_Manual_Alarm_Maintenance_System.pdf");

  const presentationHtml = path.join(DOCS_DIR, "presentation-template.html");
  const presentationPdf = path.join(DOCS_DIR, "Presentation_Alarm_Maintenance_System.pdf");

  const s1 = generatePdf(browserPath, userManualHtml, userManualPdf);
  const s2 = generatePdf(browserPath, presentationHtml, presentationPdf);

  if (s1 && s2) {
    console.log("\n🎉 Both PDF documents were generated successfully!");
  } else {
    console.error("\n⚠️ One or more PDFs failed to generate.");
    process.exit(1);
  }
}

main();
