# Secure LLM setup for static export

For `output: "export"` apps, API keys must NOT be used in client code.

## Required architecture

1. Client (`/chat`) sends requests to a secure proxy endpoint.
2. Proxy stores `GROQ_API_KEY` in server-side secrets.
3. Proxy calls `https://api.groq.com/openai/v1/chat/completions` and streams response back.

## Client env

Use only:

```env
NEXT_PUBLIC_LLM_PROXY_URL=https://your-secure-llm-proxy.example.com/chat
```

Do NOT expose Groq key via `NEXT_PUBLIC_*`.

## Key rotation

If a key was shared in chat/logs, revoke it immediately in Groq Console and issue a new one.
