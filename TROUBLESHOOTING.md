# Troubleshooting NVIDIA NIM API

## Common Issues

### 1. Model Name Issue
The model `deepseek-ai/deepseek-v4-flash` might not exist. Try these alternative models:

| Model | Description |
|-------|-------------|
| `deepseek-ai/deepseek-r1` | DeepSeek reasoning model |
| `meta/llama3-8b-instruct` | Llama 3 8B instruction model |
| `nvidia/llama3-chatqa-1.5-70b` | NVIDIA's Llama model |

### 2. Check Render Dashboard Environment

Verify these exact values are set:

| Variable | Value |
|----------|-------|
| `NVIDIA_NIM_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_NIM_MODEL` | `deepseek-ai/deepseek-r1` (try this) |
| `NVIDIA_NIM_API_KEY` | Your key (marked as Secret) |

### 3. Test API Directly

To test if your API key works, you can use curl or Postman:

```bash
curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama3-8b-instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

### 4. Check Render Logs

After redeployment, check logs for:
- "Model: deepseek-ai/deepseek-v4-flash" (or your model)
- "Has API Key: yes" (confirms key is loaded)
- Any error messages