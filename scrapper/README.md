# Runyoro Dictionary Scraper

A complete data pipeline that scrapes the legacy AngularJS Runyoro dictionary website and uses Generative AI to normalize the data structure.

## Project Structure

```text
runyoro-dictionary-scraper/
├── data/
│   ├── raw/              # Raw scraped data
│   └── processed/        # AI-polished data
├── src/
│   ├── scraper.py        # Web scraper using crawl4ai
│   └── polisher.py       # AI data normalizer (Groq or DeepSeek)
├── .env                  # Environment variables (API keys)
├── .gitignore           # Git ignore rules
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file and configure your AI provider:

**Option 1: Use DeepSeek (Recommended if you hit Groq limits)**

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
```

You can get a DeepSeek API key from [DeepSeek Platform](https://platform.deepseek.com/).

**Option 2: Use Groq**

```bash
AI_PROVIDER=groq
GROQ_API_KEY=your_actual_groq_api_key_here
```

You can get a free API key from [Groq Console](https://console.groq.com/).

## Usage

### Step 1: Scrape the Dictionary

Run the scraper to extract raw data from the AngularJS website:

```bash
python src/scraper.py
```

This will:

- Scrape `https://runyorodictionary.com/`
- Wait for AngularJS to render the content
- Extract English, Runyoro, and Swahili terms
- Save raw data to `data/raw/angular_dump.json`

### Step 2: Polish the Data

Run the polisher to normalize the data using AI:

```bash
python src/polisher.py
```

This will:

- Load the raw scraped data
- Process entries in batches of 5
- Use AI (Groq's `llama-3.3-70b-versatile` or DeepSeek's `deepseek-chat`) to:
  - Capitalize terms properly
  - Convert comma-separated Runyoro terms into JSON arrays
  - Remove null/empty fields
- Save polished data to `data/processed/polished_dictionary.json`
- Supports checkpointing to resume after rate limits

## Technical Details

### Scraper (`src/scraper.py`)

- **Library**: `crawl4ai` with `AsyncWebCrawler`
- **Target**: Legacy AngularJS v1 website
- **Key Configuration**: Waits for `css:ul[ng-repeat='result in results']` to ensure JavaScript renders before scraping
- **Extraction Strategy**: `JsonCssExtractionStrategy` with CSS selectors for each field

### Polisher (`src/polisher.py`)

- **Libraries**: `groq` and `openai` Python SDKs
- **Models**:
  - Groq: `llama-3.3-70b-versatile`
  - DeepSeek: `deepseek-chat`
- **Batch Size**: 5 entries per API call
- **Rate Limiting**: 1 second delay between batches
- **Checkpointing**: Saves progress every 10 batches and on rate limits
- **Transformations**:
  - English terms: Capitalized
  - Runyoro terms: Converted from `"foo, bar"` to `["Foo", "Bar"]`
  - Swahili terms: Capitalized

## Example Output

### Raw Data (from scraper)

```json
{
  "english_term": "hello",
  "runyoro_term": "oli otya, wasuze",
  "swahili_term": "habari"
}
```

### Polished Data (from AI)

```json
{
  "english_term": "Hello",
  "runyoro_term": ["Oli otya", "Wasuze"],
  "swahili_term": "Habari"
}
```

## Dependencies

- **crawl4ai**: Async web scraping with JavaScript rendering support
- **groq**: Groq AI API client for LLM processing
- **openai**: OpenAI-compatible API client (used for DeepSeek)
- **python-dotenv**: Environment variable management
- **nest_asyncio**: Async loop compatibility

## Notes

- The scraper handles AngularJS rendering by waiting for specific DOM elements
- The polisher uses AI to intelligently normalize data structure
- Rate limiting is implemented to respect API quotas
- All data is saved with UTF-8 encoding to preserve special characters

## License

MIT
