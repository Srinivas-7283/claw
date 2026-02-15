# Free Tier Deployment Guide 💸

You can run this entire stack for **$0/month** using these providers:

| Component | Provider | Free Tier Limits |
|-----------|----------|------------------|
| **Frontend** | Vercel | Unlimited for hobby use |
| **Backend** | Render.com | 512MB RAM, spins down after 15m inactivity |
| **Database** | Convex | 1M reads/month, 10GB storage |
| **Tunnel** | Localtunnel | Free (Dev only) |

---

## 1. Frontend (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel.com](https://vercel.com) and "Add New Project".
3. Import your repository.
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Env Variables**: Add `CONVEX_URL`, `NEXT_PUBLIC_CONVEX_URL`, etc.
5. Click **Deploy**.

## 2. Backend (Render.com)
1. Go to [Render.com](https://render.com) and create a "Web Service".
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. **Environment Variables**:
   - Copy all values from your local `.env` (`CONVEX_URL`, `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`).
5. Click **Deploy**.

### ⚠️ The "Spin Down" Issue
Render's free tier "sleeps" after 15 minutes of no traffic. This means:
- The first request (or Telegram message) will take 30-50 seconds to respond.
- Background cron jobs might not run reliably.

**Workaround:** Use [UptimeRobot](https://uptimerobot.com) (free) to ping your Render URL (`https://your-app.onrender.com/health`) every 5 minutes. This keeps it awake!

---

## 3. Database (Convex)
1. Go to your Convex Dashboard.
2. Settings > **Production**.
3. It will give you a `PROD_CONVEX_URL`.
4. Update this URL in your **Vercel** and **Render** environment variables.

---

## 4. Webhook Update
Once deployed, you must update your Telegram bot to look at the **Render URL** instead of localtunnel.

Run this locally:
```bash
curl -F "url=https://<YOUR-RENDER-APP-NAME>.onrender.com/webhook/telegram/<TOKEN>" https://api.telegram.org/bot<TOKEN>/setWebhook
```
