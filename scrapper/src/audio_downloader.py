"""
Runyoro Dictionary Audio Downloader
Downloads audio files for dictionary entries using the scraped JSON data.
Uses aiohttp for high-concurrency downloading.
"""

import asyncio
import json
import aiohttp
from pathlib import Path
from typing import List, Dict


async def download_file(session: aiohttp.ClientSession, url: str, output_path: Path, semaphore: asyncio.Semaphore) -> bool:
    """
    Download a single file with concurrency limit.
    """
    async with semaphore:
        try:
            if output_path.exists():
                return True
                
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    content = await response.read()
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, 'wb') as f:
                        f.write(content)
                    return True
                else:
                    return False
        except Exception as e:
            return False


async def process_entries(entries: List[Dict], audio_dir: Path, base_url: str, concurrency: int = 20):
    """
    Process all entries and download audio files concurrently.
    """
    semaphore = asyncio.Semaphore(concurrency)
    tasks = []
    
    print(f"Starting download with {concurrency} concurrent connections...")
    
    async with aiohttp.ClientSession() as session:
        for entry in entries:
            audio_path = entry.get('audio')
            if audio_path:
                audio_url = f"{base_url}/{audio_path}"
                filename = Path(audio_path).name
                local_file = audio_dir / filename
                
                # Add local path to entry immediately (will be verified by download status)
                entry['local_audio'] = str(local_file.relative_to(Path(__file__).parent.parent))
                
                task = download_file(session, audio_url, local_file, semaphore)
                tasks.append(task)
        
        # Run all downloads
        results = await asyncio.gather(*tasks)
        
    success_count = sum(1 for r in results if r)
    fail_count = len(results) - success_count
    
    return success_count, fail_count


def main():
    # Setup paths
    base_dir = Path(__file__).parent.parent
    input_file = base_dir / "data" / "raw" / "angular_dump.json"
    output_file = base_dir / "data" / "raw" / "dictionary_with_audio.json"
    audio_dir = base_dir / "data" / "audio"
    
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return
        
    print(f"Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        entries = json.load(f)
    
    print(f"Loaded {len(entries)} entries.")
    
    # Run downloader
    base_url = "https://runyorodictionary.com"
    success, failed = asyncio.run(process_entries(entries, audio_dir, base_url))
    
    print(f"\nDownload Complete:")
    print(f"✓ Success: {success}")
    print(f"✗ Failed: {failed}")
    
    # Save updated data
    print(f"Saving updated data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    print("Done!")


if __name__ == "__main__":
    main()
