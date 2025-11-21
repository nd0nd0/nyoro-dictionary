"""
Runyoro Dictionary Data Polisher
Uses AI (Groq or DeepSeek) to normalize and clean the scraped dictionary data.
Supports checkpointing and resuming from rate limit errors.
"""

import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
import re
from groq import Groq
from openai import OpenAI


# Load environment variables
load_dotenv()


def load_raw_data():
    """Load the raw scraped data from JSON file."""
    raw_file = Path(__file__).parent.parent / "data" / "raw" / "angular_dump.json"
    
    if not raw_file.exists():
        raise FileNotFoundError(
            f"Raw data file not found: {raw_file}\n"
            "Please run scraper.py first to generate the raw data."
        )
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✓ Loaded {len(data)} entries from {raw_file}")
    return data


def load_checkpoint():
    """Load checkpoint data if it exists."""
    checkpoint_file = Path(__file__).parent.parent / "data" / "processed" / "checkpoint.json"
    
    if checkpoint_file.exists():
        with open(checkpoint_file, 'r', encoding='utf-8') as f:
            checkpoint = json.load(f)
        print(f"✓ Found checkpoint at batch {checkpoint['last_batch']}/{checkpoint['total_batches']}")
        return checkpoint
    
    return None


def save_checkpoint(polished_data, last_batch, total_batches):
    """Save checkpoint data."""
    checkpoint_file = Path(__file__).parent.parent / "data" / "processed" / "checkpoint.json"
    checkpoint_file.parent.mkdir(parents=True, exist_ok=True)
    
    checkpoint = {
        'polished_data': polished_data,
        'last_batch': last_batch,
        'total_batches': total_batches
    }
    
    with open(checkpoint_file, 'w', encoding='utf-8') as f:
        json.dump(checkpoint, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved checkpoint at batch {last_batch}/{total_batches}")


def create_polish_prompt(batch):
    """
    Create a prompt for the AI to polish a batch of dictionary entries.
    
    Args:
        batch: List of dictionary entries to polish
        
    Returns:
        str: The formatted prompt
    """
    return f"""You are a data normalization assistant. Clean and normalize the following dictionary entries:

INPUT DATA:
{json.dumps(batch, indent=2)}

CRITICAL RULES:
1. IF 'swahili_term' IS MISSING, EMPTY (""), OR NULL, YOU MUST GENERATE A CORRECT SWAHILI TRANSLATION.
2. DO NOT LEAVE 'swahili_term' EMPTY.
3. Return ONLY valid JSON.

INSTRUCTIONS:
1. Capitalize the first letter of each word in 'english_term'
2. Convert 'runyoro_term' from a comma-separated string into a JSON array of strings, capitalizing the first letter of each term
3. If 'swahili_term' is present, capitalize the first letter of each word
4. If 'swahili_term' is missing/empty, TRANSLATE based on English/Runyoro terms
5. PRESERVE 'audio' and 'image' fields exactly as they appear in the input
6. PRESERVE 'examples' field if present
7. Remove any null or empty fields (except audio, image, and examples which should be preserved)
8. Ensure consistent formatting

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects.

Examples:
Input: {{"english_term": "hello", "runyoro_term": "oli otya", "swahili_term": "", "audio": "audio/hello.mp3", "image": "image/hello.png"}}
Output: {{"english_term": "Hello", "runyoro_term": ["Oli otya"], "swahili_term": "Habari", "audio": "audio/hello.mp3", "image": "image/hello.png"}}

Input: {{"english_term": "cow", "runyoro_term": "ente", "swahili_term": null, "audio": "audio/cow.mp3", "image": "image/cow.png", "examples": ""}}
Output: {{"english_term": "Cow", "runyoro_term": ["Ente"], "swahili_term": "Ng'ombe", "audio": "audio/cow.mp3", "image": "image/cow.png"}}
"""


def polish_batch(client, batch, batch_num, total_batches, provider="groq"):
    """
    Send a batch to AI provider for polishing.
    
    Args:
        client: AI client instance (Groq or OpenAI)
        batch: List of entries to polish
        batch_num: Current batch number
        total_batches: Total number of batches
        provider: "groq" or "deepseek"
        
    Returns:
        tuple: (polished_batch, rate_limited)
    """
    print(f"\nProcessing batch {batch_num}/{total_batches} ({len(batch)} entries) with {provider.upper()}...")
    
    # Select model based on provider
    if provider == "deepseek":
        model = "deepseek-chat"
    elif provider == "local":
        model = os.getenv("LOCAL_LLM_MODEL", "local-model")
    else:  # groq
        model = "llama-3.3-70b-versatile"
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a data normalization expert. You clean and structure dictionary data precisely as instructed. Always return valid JSON without any markdown formatting or explanatory text."
                },
                {
                    "role": "user",
                    "content": create_polish_prompt(batch)
                }
            ],
            model=model,
            temperature=0.3 if provider == "local" else 0.1,  # Higher temp for local to encourage translation
            max_tokens=2000
        )
        
        # Extract the response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Remove <think>...</think> blocks (common in reasoning models like DeepSeek-R1)
        response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        # Parse the JSON response
        polished_batch = json.loads(response_text)
        
        print(f"✓ Successfully polished batch {batch_num}")
        return polished_batch, False
        
    except json.JSONDecodeError as e:
        print(f"✗ JSON decode error in batch {batch_num}: {e}")
        print(f"Response was: {response_text[:200]}...")
        return batch, False  # Return original batch if parsing fails
        
    except Exception as e:
        error_str = str(e)
        if "rate_limit" in error_str.lower() or "429" in error_str:
            print(f"✗ Rate limit hit at batch {batch_num}")
            print(f"   {error_str}")
            return batch, True  # Return original batch and signal rate limit
        else:
            print(f"✗ Error processing batch {batch_num}: {e}")
            return batch, False  # Return original batch if processing fails


def polish_data():
    """
    Main function to polish the dictionary data using AI (Groq or DeepSeek).
    """
    # Determine which provider to use
    provider = os.getenv("AI_PROVIDER", "groq").lower()
    
    if provider == "deepseek":
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key or api_key == "your_deepseek_api_key_here":
            raise ValueError(
                "DEEPSEEK_API_KEY not found or not set in .env file.\n"
                "Please add your DeepSeek API key to the .env file."
            )
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
        print(f"✓ Using DeepSeek API")
    elif provider == "local":
        base_url = os.getenv("LOCAL_LLM_BASE_URL", "http://localhost:1234/v1")
        # Local LLMs don't usually need a real API key, but the client requires one
        client = OpenAI(
            api_key="lm-studio",
            base_url=base_url,
            timeout=120.0  # Increase timeout for local models (2 minutes)
        )
        print(f"✓ Using Local LLM at {base_url}")
    else:  # groq
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key == "your_groq_api_key_here":
            raise ValueError(
                "GROQ_API_KEY not found or not set in .env file.\n"
                "Please add your Groq API key to the .env file."
            )
        client = Groq(api_key=api_key)
        print(f"✓ Using Groq API")
    
    # Check for existing checkpoint
    checkpoint = load_checkpoint()
    
    if checkpoint:
        polished_data = checkpoint['polished_data']
        start_batch = checkpoint['last_batch'] + 1
        raw_data = load_raw_data()
        print(f"✓ Resuming from batch {start_batch}")
    else:
        # Load raw data
        raw_data = load_raw_data()
        polished_data = []
        start_batch = 1
    
    # Process in batches of 5
    batch_size = 5
    batches = [raw_data[i:i + batch_size] for i in range(0, len(raw_data), batch_size)]
    total_batches = len(batches)
    
    print(f"\n{'='*60}")
    print(f"POLISHING {len(raw_data)} ENTRIES IN {total_batches} BATCHES")
    if checkpoint:
        print(f"RESUMING FROM BATCH {start_batch}/{total_batches}")
    print(f"{'='*60}")
    
    for i in range(start_batch - 1, total_batches):
        batch_num = i + 1
        batch = batches[i]
        
        polished_batch, rate_limited = polish_batch(client, batch, batch_num, total_batches, provider)
        polished_data.extend(polished_batch)
        
        # Save checkpoint every 10 batches or if rate limited
        if rate_limited or batch_num % 10 == 0:
            save_checkpoint(polished_data, batch_num, total_batches)
        
        # If rate limited, stop processing
        if rate_limited:
            print(f"\n{'='*60}")
            print(f"RATE LIMIT REACHED")
            print(f"{'='*60}")
            print(f"✓ Processed {batch_num} batches ({len(polished_data)} entries)")
            print(f"✓ Checkpoint saved - run again later to resume")
            return
        
        # Rate limiting: wait 1 second between batches
        if batch_num < total_batches:
            time.sleep(1)
    
    # Save final polished data
    output_dir = Path(__file__).parent.parent / "data" / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "polished_dictionary.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(polished_data, f, indent=2, ensure_ascii=False)
    
    # Remove checkpoint file on successful completion
    checkpoint_file = output_dir / "checkpoint.json"
    if checkpoint_file.exists():
        checkpoint_file.unlink()
        print("✓ Removed checkpoint file")
    
    print(f"\n{'='*60}")
    print(f"POLISHING COMPLETE")
    print(f"{'='*60}")
    print(f"✓ Processed {len(polished_data)} entries")
    print(f"✓ Saved to: {output_file}")
    
    # Show sample
    if polished_data:
        print("\nSample polished entry:")
        print(json.dumps(polished_data[0], indent=2, ensure_ascii=False))


def main():
    """Main entry point for the polisher."""
    try:
        polish_data()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        raise


if __name__ == "__main__":
    main()
