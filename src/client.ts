import { chromium, Browser, Page } from 'playwright';
import { Restaurant, TabelogResponse } from './types.js';

export class TabelogClient {
    private browser: Browser | null = null;

    async initialize(): Promise<void> {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-dev-shm-usage']
            });
        }
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Scrape restaurant data from Tabelog
     */
    async scrapeRestaurants(region: string = "kyoto", limit: number = 10): Promise<TabelogResponse> {
        if (!this.browser) {
            await this.initialize();
        }

        const page = await this.browser!.newPage();
        
        // Set user agent to avoid detection
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        // Navigate to Tabelog with highest rated restaurants
        const url = `https://tabelog.com/en/${region}/rstLst/RC/?SrtT=rt`;
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Wait for restaurant list to load
        await page.waitForSelector('.list-rst', { timeout: 10000 });
        
        const restaurants: Restaurant[] = [];
        
        // Extract restaurant data using Playwright locators
        const restaurantElements = await page.locator('.list-rst').all();
        
        for (let i = 0; i < Math.min(restaurantElements.length, limit); i++) {
            try {
                const element = restaurantElements[i];
                
                // Extract restaurant name
                const nameElement = element.locator('.list-rst__rst-name a');
                const name = await nameElement.textContent() || "N/A";
                
                // Extract restaurant URL
                const urlElement = element.locator('.list-rst__rst-name a');
                let href = await urlElement.getAttribute('href') || "N/A";
                if (href && !href.startsWith('http')) {
                    href = `https://tabelog.com${href}`;
                }
                
                // Extract rating
                const ratingElement = element.locator('.list-rst__rating-val');
                const rating = await ratingElement.textContent() || "N/A";
                
                // Extract cuisine and location from area-genre element
                const areaGenreElement = element.locator('.list-rst__area-genre');
                const areaGenreText = await areaGenreElement.textContent() || "";
                
                let location = "N/A";
                let cuisine = "N/A";
                
                if (areaGenreText && areaGenreText.trim()) {
                    // Split by " / " to separate location and cuisine
                    const parts = areaGenreText.trim().split(' / ');
                    if (parts.length >= 2) {
                        location = parts[0].trim();
                        cuisine = parts[1].trim();
                    } else if (parts.length === 1) {
                        // If only one part, assume it's location
                        location = parts[0].trim();
                    }
                }
                
                // Extract price information
                let price = "N/A";
                const priceElements = await element.locator('.c-rating-v3__val').all();
                const prices: string[] = [];
                
                for (const priceElem of priceElements) {
                    const priceText = await priceElem.textContent();
                    if (priceText && priceText.trim() && priceText.trim() !== "-") {
                        prices.push(priceText.trim());
                    }
                }
                
                if (prices.length > 0) {
                    // Join all non-empty prices
                    price = prices.join(' / ');
                }
                
                const restaurant: Restaurant = {
                    name: name.trim(),
                    rating: rating.trim(),
                    url: href,
                    cuisine: cuisine.trim(),
                    price: price.trim(),
                    location: location.trim(),
                    rank: i + 1
                };
                
                restaurants.push(restaurant);
                
            } catch (error) {
                console.error(`Error extracting restaurant ${i+1}:`, error);
                continue;
            }
        }
        
        await page.close();
        
        return {
            region,
            count: restaurants.length,
            restaurants
        };
    }

    /**
     * Take a snapshot of the Tabelog page
     */
    async takeSnapshot(region: string = "kyoto"): Promise<{ success: boolean; message: string; url: string }> {
        if (!this.browser) {
            await this.initialize();
        }

        const page = await this.browser!.newPage();
        const url = `https://tabelog.com/en/${region}/rstLst/RC/?SrtT=rt`;
        
        try {
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Take a screenshot
            const screenshot = await page.screenshot({ fullPage: true });
            
            await page.close();
            
            return {
                success: true,
                message: `Snapshot taken for ${region} region. Page loaded successfully.`,
                url
            };
        } catch (error) {
            await page.close();
            return {
                success: false,
                message: `Error taking snapshot: ${error instanceof Error ? error.message : String(error)}`,
                url
            };
        }
    }
}
