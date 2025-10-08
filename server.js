import express from "express";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Scraper function
async function scrapeLinkedInJobs(companyName) {
  const browser = await puppeteer.launch({
    headless: true, // set false if you want to see the browser
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Login
  await page.goto("https://www.linkedin.com/login", { waitUntil: "networkidle2" });
  await page.type("#username", process.env.LINKEDIN_USER, { delay: 100 });
  await page.type("#password", process.env.LINKEDIN_PASS, { delay: 100 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Go to jobs search
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(companyName)}`;
  await page.goto(searchUrl, { waitUntil: "networkidle2" });

  // Extract jobs
  const jobs = await page.evaluate(() => {
    const jobNodes = document.querySelectorAll(".jobs-search-results__list-item");
    return Array.from(jobNodes).map(job => {
      const title = job.querySelector(".base-search-card__title")?.innerText.trim();
      const company = job.querySelector(".base-search-card__subtitle")?.innerText.trim();
      const location = job.querySelector(".job-search-card__location")?.innerText.trim();
      const link = job.querySelector("a")?.href;
      return { title, company, location, link };
    });
  });

  await browser.close();
  return jobs;
}

// API route
app.get("/api/company-jobs", async (req, res) => {
  const company = req.query.name;
  if (!company) return res.status(400).json({ error: "Company name required" });

  try {
    const jobs = await scrapeLinkedInJobs(company);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
