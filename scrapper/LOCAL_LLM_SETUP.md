# Using Local LLMs (LM Studio)

This project supports using local Large Language Models (LLMs) via tools like LM Studio to polish dictionary data. This is a great alternative to paid APIs like Groq or DeepSeek, as it's free and has no rate limits.

## Prerequisites

1.  **Install LM Studio**: Download and install from [lmstudio.ai](https://lmstudio.ai/).
2.  **Download a Model**: Open LM Studio and search for a model. Recommended models for this task:
    - `DeepSeek-R1-Distill-Llama-8B` (Good balance of speed and quality)
    - `Llama-3.2-3B-Instruct` (Faster, lower resource usage)
    - `Mistral-7B-Instruct`

## Setup Steps

### 1. Configure LM Studio Server

1.  Open LM Studio.
2.  Go to the **Local Server** tab (double arrow icon on the left).
3.  Select your downloaded model from the top dropdown.
4.  Start the server by clicking **Start Server**.
5.  Note the URL (usually `http://localhost:1234`).

### 2. Configure the Project

Update your `.env` file with the following settings:

```bash
# Set provider to local
AI_PROVIDER=local

# Local Server Configuration (defaults shown)
LOCAL_LLM_BASE_URL=http://localhost:1234/v1
LOCAL_LLM_MODEL=local-model
```

> **Note**: `LOCAL_LLM_MODEL` is often ignored by local servers if only one model is loaded, but some servers require a specific model name.

### 3. Run the Polisher

Run the polisher script as usual:

```bash
python src/polisher.py
```

The script will detect the `local` provider and connect to your local server.

## Troubleshooting

- **Connection Refused / Timeout**:
  - **Windows/WSL Users**: You likely need to allow the port through the Windows Firewall. Run this command in **PowerShell as Administrator**:
    ```powershell
    netsh advfirewall firewall add rule name="LM Studio" dir=in action=allow protocol=TCP localport=1234
    ```
  - **Network Access**: In LM Studio, ensure "Cross-Origin-Resource-Sharing (CORS)" is enabled if available, or check if there's a setting to allow connections from local network/WSL.
- **Slow Processing**: Local LLMs depend on your hardware (GPU/CPU). If it's too slow, try a smaller model (e.g., a "quantized" version like `Q4_K_M` or a smaller parameter count like 3B or 7B).
- **Context Length Errors**: Ensure the model's context window is large enough (at least 4096 tokens recommended). You can adjust this in LM Studio settings.
