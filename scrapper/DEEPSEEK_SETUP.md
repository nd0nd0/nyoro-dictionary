# Quick Start: Switching to DeepSeek

Since you've hit the Groq rate limit, here's how to switch to DeepSeek:

## Step 1: Update Your .env File

Add these two lines to your `.env` file:

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
```

Replace `your_actual_deepseek_api_key_here` with your actual DeepSeek API key.

## Step 2: Get Your DeepSeek API Key

1. Go to [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it into your `.env` file

## Step 3: Resume Processing

Simply run the polisher again:

```bash
python src/polisher.py
```

The script will:

- Automatically detect that you're using DeepSeek (from `AI_PROVIDER=deepseek`)
- Resume from your last checkpoint
- Continue processing the remaining batches

## What Changed?

The polisher now supports **two AI providers**:

1. **Groq** (default) - Uses `llama-3.3-70b-versatile`
2. **DeepSeek** - Uses `deepseek-chat`

Both providers use the same prompts and produce identical output format.

## Switching Back to Groq

If you want to switch back to Groq later, just change your `.env`:

```bash
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
```

## Benefits of DeepSeek

- **Higher rate limits** - Less likely to hit API limits
- **Cost-effective** - Generally cheaper than other providers
- **Good quality** - Produces high-quality normalized data
- **OpenAI-compatible API** - Easy to integrate

## Notes

- The checkpoint system works across both providers
- You can switch providers mid-processing if needed
- All configuration is done via environment variables
- No code changes required to switch providers
