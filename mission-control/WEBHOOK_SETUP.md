# Telegram Webhook Setup Guide

Since your backend is running locally (`localhost`), Telegram's servers cannot reach it directly. You need to create a secure "tunnel" to expose your local server to the internet.

## Prerequisites
- Node.js installed
- A Telegram Bot Token (from @BotFather)

## Step 1: Start the Tunnel
1. Open a **new terminal window** (keep your `npm run dev` terminals running).
2. Run the following command to expose port `3001`:

```bash
npx localtunnel --port 3001
```

3. It will print a URL like: `https://slimy-dog-42.loca.lt`. **Copy this URL.**
   > **Note:** Keep this terminal open! The tunnel stops if you close it.

## Step 2: Set the Webhook
We have created a helper script to make this easy.

1. Open another terminal in the `backend` folder:
   ```bash
   cd backend
   ```

2. Run the setup script:
   ```bash
   npx ts-node scripts/set-webhook.ts
   ```

3. Follow the prompts:
   - **Bot Token**: Paste your token (e.g., `123456:ABC-DEF...`)
   - **Public URL**: Paste the URL from Step 1 (e.g., `https://slimy-dog-42.loca.lt`)

## Step 3: Verify
1. Send a message "Hello" to your bot on Telegram.
2. Check your backend terminal logs. You should see:
   ```text
   Received Telegram message ...
   Processed message from ...
   ```
3. Check the **Mission Control Dashboard > Tasks**. A new task should appear!
