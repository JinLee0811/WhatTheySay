import puppeteer, { Browser } from "puppeteer";
import { Review } from "../types";

export async function crawlReviews(url: string): Promise<Review[]> {
  let browser: Browser | null = null;
  console.log(`Crawling reviews for URL: ${url}`);
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Browser launched.");

    const page = await browser.newPage();
    console.log("Navigating to page...");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    console.log("Page loaded.");

    console.log("Waiting for review section selector...");
    const reviewSelector = "div.jJc9Ad";
    await page.waitForSelector(reviewSelector, { timeout: 60000 });
    console.log("Review section found.");

    // 여러 번 스크롤하여 더 많은 리뷰 로드
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, document.body.scrollHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("Evaluating page to extract reviews...");
    const reviews = await page.evaluate((selector) => {
      const reviewElements = document.querySelectorAll(selector);
      console.log(`Found ${reviewElements.length} review elements.`);
      return Array.from(reviewElements)
        .slice(0, 20)
        .map((element) => {
          const textElement = element.querySelector("span.wiI7pd");
          const ratingElement = element.querySelector('span.kvMYJc[role="img"]');
          const dateElement = element.querySelector("span.rsqaWe");

          const text = textElement?.textContent || "";
          const ratingText = ratingElement?.getAttribute("aria-label") || "";
          const ratingMatch = ratingText.match(/\d+/);
          const rating = ratingMatch ? parseInt(ratingMatch[0], 10) : 0;
          const date = dateElement?.textContent || "";

          return {
            text: text.trim(),
            rating,
            date: date.trim(),
          };
        });
    }, reviewSelector);

    console.log(`Extracted ${reviews.length} reviews.`);
    return reviews;
  } catch (error) {
    console.error("Error during crawling:", error);
    if (error instanceof Error) {
      if (error.message.includes("Timeout")) {
        throw new Error("Page navigation or element loading timed out.");
      }
      if (error.message.includes("selector")) {
        throw new Error(
          "Could not find the review elements. Google Maps structure might have changed."
        );
      }
    }
    throw new Error(
      `Failed to crawl reviews: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
      console.log("Browser closed.");
    }
  }
}
