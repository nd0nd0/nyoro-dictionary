"""
Runyoro Dictionary Scraper
Scrapes the legacy AngularJS dictionary website by intercepting network requests.
When letter buttons are clicked, the site fetches JSON data via AJAX requests.
"""

import asyncio
import json
import string
from pathlib import Path
from playwright.async_api import async_playwright


async def scrape_letter_with_interception(page, letter):
    """
    Click a letter button and intercept the network request to capture JSON data.
    
    Args:
        page: Playwright page instance
        letter: Letter to filter by (A-Z)
        
    Returns:
        list: Dictionary entries for that letter
    """
    print(f"\n[{letter}] Setting up network interception...")
    
    captured_data = {}
    
    async def handle_response(response):
        """Capture JSON responses"""
        try:
            # Check if this is a JSON response
            if 'json' in response.headers.get('content-type', '').lower():
                url = response.url
                # Check if it's the English dictionary data
                if f'English{letter}' in url or f'english{letter}' in url.lower():
                    data = await response.json()
                    captured_data['words'] = data.get('words', {})
                    print(f"[{letter}] ✓ Captured JSON response from: {url}")
        except Exception as e:
            pass  # Ignore errors from non-JSON responses
    
    # Set up response listener
    page.on('response', handle_response)
    
    try:
        # Click the letter button
        button_selector = f'.letters button.ng-binding:has-text("{letter}")'
        print(f"[{letter}] Clicking letter button...")
        await page.click(button_selector, timeout=5000)
        
        # Wait for the network request to complete
        await asyncio.sleep(2.0)
        
        # Remove the listener
        page.remove_listener('response', handle_response)
        
        # Process captured data
        if 'words' in captured_data:
            words_dict = captured_data['words']
            entries = []
            
            for english_word, translations in words_dict.items():
                for translation in translations:
                    entry = {
                        'english_term': english_word,
                        'runyoro_term': translation.get('runyoro', ''),
                        'swahili_term': translation.get('swahili', ''),
                        'examples': translation.get('examples', ''),
                        'image': translation.get('image', ''),
                        'audio': translation.get('audio', '')
                    }
                    entries.append(entry)
            
            print(f"[{letter}] ✓ Extracted {len(entries)} entries")
            return entries
        else:
            print(f"[{letter}] ✗ No JSON data captured")
            return []
            
    except Exception as e:
        print(f"[{letter}] ✗ Error: {e}")
        page.remove_listener('response', handle_response)
        return []


async def scrape_dictionary():
    """
    Scrape the entire Runyoro dictionary by intercepting network requests for all letters A-Z.
    """
    
    # Ensure output directory exists
    output_dir = Path(__file__).parent.parent / "data" / "raw"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "angular_dump.json"
    
    print("="*60)
    print("RUNYORO DICTIONARY SCRAPER")
    print("="*60)
    print(f"Target: https://runyorodictionary.com/")
    print(f"Strategy: Intercept AJAX requests when clicking letters")
    print("="*60)
    
    all_entries = []
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to the dictionary
        print("\nNavigating to dictionary...")
        await page.goto("https://runyorodictionary.com/", wait_until="networkidle")
        
        # Wait for the page to be ready
        await page.wait_for_selector('.letters button.ng-binding', timeout=10000)
        print("✓ Page loaded successfully\n")
        
        # Iterate through A-Z
        for letter in string.ascii_uppercase:
            entries = await scrape_letter_with_interception(page, letter)
            all_entries.extend(entries)
            
            # Small delay between letters
            await asyncio.sleep(0.5)
        
        await browser.close()
    
    # Save to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_entries, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("SCRAPING COMPLETE")
    print("="*60)
    print(f"✓ Total entries scraped: {len(all_entries)}")
    print(f"✓ Data saved to: {output_file}")
    
    # Show sample
    if all_entries:
        print("\nSample entries:")
        for i, entry in enumerate(all_entries[:3], 1):
            print(f"\n{i}. English: {entry['english_term']}")
            print(f"   Runyoro: {entry['runyoro_term']}")
            print(f"   Swahili: {entry['swahili_term']}")
    else:
        print("\n⚠ Warning: No entries were scraped!")
    
    return all_entries


def main():
    """Main entry point for the scraper."""
    try:
        # Run the async scraper
        result = asyncio.run(scrape_dictionary())
        
        if result and len(result) > 0:
            print("\n" + "="*50)
            print("SUCCESS")
            print("="*50)
        else:
            print("\n" + "="*50)
            print("SCRAPING FAILED - No data collected")
            print("="*50)
            
    except Exception as e:
        print(f"\n✗ Error: {e}")
        raise


if __name__ == "__main__":
    main()
