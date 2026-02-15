# Mission Control - Multi-Agent AI Platform

A production-ready multi-tenant SaaS platform for deploying autonomous AI agent teams.

## Features

- 🤖 **Multi-Agent System** - Deploy teams of specialized AI agents
- 🔄 **Multi-Provider Support** - OpenAI, Claude, Gemini, Grok
- 💬 **Multi-Channel** - Telegram, WhatsApp messaging
- 🏢 **Multi-Tenant** - Isolated workspaces per customer
- 🔐 **Secure** - Encrypted API keys, workspace isolation
- 📊 **Usage Tracking** - Monitor API usage and costs
- ⚡ **Real-time** - Convex database with live updates

## Quick Start

### Prerequisites

- Node.js 20+
- Convex account (free tier)
- API keys for AI providers (customer-provided)

### Installation

```bash
# Clone repository
cd mission-control/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run development server
npm run dev
```

### Environment Setup

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```
ENCRYPTION_MASTER_KEY=<generated-key>
CONVEX_URL=https://your-app.convex.cloud
```

## Project Structure

```
backend/
├── src/
│   ├── agents/          # Agent implementations
│   ├── services/        # Business logic
│   │   └── ai/         # AI provider abstraction
│   ├── api/            # Express routes
│   ├── jobs/           # Cron jobs & background tasks
│   ├── config/         # Configuration files
│   └── utils/          # Utilities
├── convex/             # Convex database schema
└── package.json
```

## Documentation

See the `/brain` artifacts for complete documentation:
- `implementation_plan.md` - Technical architecture
- `saas_architecture.md` - Multi-tenant design
- `hetzner_deployment.md` - Deployment guide
- `proven_patterns.md` - Best practices

## License

MIT
