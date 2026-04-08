import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos/",
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err.message}"))

        # Mock API routes
        await page.route("**/api/rates**", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"rates": [{"metal": "Gold 24K", "price": 7855}, {"metal": "Gold 22K", "price": 7200}, {"metal": "Gold 18K", "price": 5891}, {"metal": "Silver 925", "price": 92}]}'
        ))
        await page.route("**/api/products**", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"data": []}'
        ))
        await page.route("**/api/auth/me**", lambda route: route.fulfill(
            status=401,
            content_type="application/json",
            body='{"error": "Not authenticated"}'
        ))

        print("Navigating to http://localhost:4173")
        await page.goto("http://localhost:4173", wait_until="networkidle")

        print("Waiting for Navbar element...")
        try:
            await page.wait_for_selector('nav', timeout=5000)
        except Exception as e:
            print("Could not find nav:", e)
            await page.screenshot(path="/home/jules/verification/screenshots/error_state.png")

        print("Looking for Search button...")
        try:
            search_btn = page.locator('button[aria-label="Search"]')
            await search_btn.wait_for(state="visible", timeout=5000)
            await search_btn.focus()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/home/jules/verification/screenshots/search_focused.png")
            print("Search button focused successfully!")
        except Exception as e:
            print("Could not focus Search button:", e)

        print("Looking for User Menu button...")
        try:
            user_btn = page.locator('button[aria-label="User Menu"]')
            await user_btn.wait_for(state="visible", timeout=5000)
            await user_btn.focus()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="/home/jules/verification/screenshots/user_menu_focused.png")
            print("User Menu focused successfully!")
        except Exception as e:
            print("Could not focus User Menu:", e)

        print("Closing context to save video...")
        await context.close()
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(run())
