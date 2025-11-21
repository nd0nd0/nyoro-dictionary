# Using Local LLMs with Ollama

This project supports using local Large Language Models (LLMs) via Ollama to polish dictionary data. This is a great alternative to paid APIs like Groq or DeepSeek, as it's free and has no rate limits.

## Prerequisites

1. **Install Ollama**: Download and install from [ollama.ai](https://ollama.ai/)
2. **Pull a Model**: Download the llama3.2:3b model (or any other model you prefer)

## Setup Steps

### 1. Install and Start Ollama

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the llama3.2:3b model
ollama pull llama3.2:3b

# Verify Ollama is running
ollama list
```

Ollama automatically starts a server on `http://localhost:11434` when you run any command.

### 2. Configure the Project

Update your `.env` file with the following settings:

```bash
# Set provider to local
AI_PROVIDER=local

# Ollama Server Configuration
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
LOCAL_LLM_MODEL=llama3.2:3b
```

### 3. Run the Polisher

Run the polisher script as usual:

```bash
python src/polisher.py
```

The script will detect the `local` provider and connect to your Ollama server.

## Recommended Models

- **llama3.2:3b** - Fast, good for structured data tasks (recommended)
- **llama3.2:1b** - Even faster, lower quality
- **llama3.1:8b** - Better quality, slower
- **mistral:7b** - Good alternative

## Troubleshooting

### Connection Refused / Timeout

1. **Check if Ollama is running**:

   ```bash
   ollama list
   ```

   If this fails, Ollama is not running. Start it with any command like `ollama list`.

2. **Test the API endpoint**:

   ```bash
   curl http://localhost:11434/api/tags
   ```

   This should return a JSON list of installed models.

3. **WSL Users**: If running in WSL, you may need to:
   - Install Ollama inside WSL (recommended)
   - OR configure Ollama on Windows to listen on all interfaces and update the base URL to use the Windows host IP

### Slow Processing

Local LLMs depend on your hardware (GPU/CPU). If it's too slow:

- Try a smaller model (e.g., `llama3.2:1b`)
- Ensure you have enough RAM (3B models need ~4GB, 8B models need ~8GB)
- If you have an NVIDIA GPU, ensure Ollama is using it (check with `nvidia-smi` while running)

### Poor Quality Translations

If the model isn't generating good Swahili translations:

- Try a larger model (e.g., `llama3.1:8b` or `mistral:7b`)
- Increase the temperature in `polisher.py` (currently set to 0.3)
- Provide more examples in the prompt

### Model Not Found Error

If you get a "model not found" error:

```bash
# List available models
ollama list

# Pull the model if missing
ollama pull llama3.2:3b
```

## Performance Tips

1. **Use GPU acceleration**: Ollama automatically uses GPU if available (NVIDIA/AMD)
2. **Adjust batch size**: In `polisher.py`, you can reduce `batch_size` from 5 to 2-3 for faster processing
3. **Monitor resources**: Use `htop` or `nvidia-smi` to monitor CPU/GPU usage
