# Mission Control - Quick Start Guide

## 🚀 Getting Started

### 1. Run Setup Script

```powershell
cd mission-control
.\setup.ps1
```

This will:
- Install all dependencies
- Generate encryption key
- Create `.env` file
- Setup project structure

### 2. Setup Convex

```powershell
cd convex
npx convex dev
```

Follow the prompts to:
- Create a Convex account (free)
- Create a new project
- Copy the deployment URL

### 3. Configure Environment

Edit `backend/.env`:

```bash
# Add your Convex URL (from step 2)
CONVEX_URL=https://your-app.convex.cloud

# Optional: Add test API keys
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...
```

### 4. Deploy Convex Schema

```powershell
cd convex
npx convex deploy
```

### 5. Start Development Server

```powershell
cd backend
npm run dev
```

Server will start on http://localhost:3000

### 6. Test Health Check

Open browser: http://localhost:3000/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T...",
  "uptime": 1.234
}
```

## 📁 Project Structure

```
mission-control/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── services/ai/  # AI provider abstraction
│   │   ├── utils/        # Utilities (encryption, logger)
│   │   └── index.ts      # Express server
│   └── package.json
├── convex/               # Database schema
│   └── schema.ts
└── README.md
```

## 🔑 Getting API Keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Anthropic (Claude)
1. Go to https://console.anthropic.com/
2. Get API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

### Google (Gemini)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env`: `GOOGLE_API_KEY=...`

### Telegram Bot
1. Message @BotFather on Telegram
2. Send `/newbot` and follow prompts
3. Copy bot token
4. Add to `.env`: `TELEGRAM_BOT_TOKEN=...`

## 🧪 Testing

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/
```

## 📚 Next Steps

1. **Build Agent System** - Implement core Agent class
2. **Add Memory System** - File-based memory management
3. **Telegram Integration** - Webhook setup
4. **Task Management** - CRUD operations
5. **Deploy to Hetzner** - Production deployment

## 🆘 Troubleshooting

### Port already in use
```powershell
# Change PORT in .env
PORT=3001
```

### Convex connection error
- Check `CONVEX_URL` in `.env`
- Run `npx convex dev` first

### Missing dependencies
```powershell
cd backend
npm install
```

## 📖 Documentation

See `/brain` artifacts for complete docs:
- `implementation_plan.md` - Technical architecture
- `saas_architecture.md` - Multi-tenant design
- `hetzner_deployment.md` - Deployment guide
- `proven_patterns.md` - Best practices
- `executive_summary.md` - Project overview

---

**Need help?** Check the documentation or review the code comments.
