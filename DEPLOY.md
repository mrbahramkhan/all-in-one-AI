# 🚀 All-In-One AI — Online Deploy Guide

## Fastest Way: Railway.app (10 minutes, FREE)

### Step 1: GitHub pe code daalo
```bash
git init
git add .
git commit -m "Initial commit"
# GitHub pe naya repo banao: github.com/new
git remote add origin https://github.com/YOUR_USERNAME/all-in-one-ai.git
git push -u origin main
```

### Step 2: Railway pe deploy karo
1. railway.app pe jao → "Start a New Project"
2. "Deploy from GitHub repo" → apna repo select karo
3. "Add Variables" pe click karo → yeh env vars daalo:
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-...          ← platform.openai.com
   ANTHROPIC_API_KEY=sk-ant-...   ← console.anthropic.com
   JWT_SECRET=random-64-chars
   JWT_REFRESH_SECRET=another-random-64-chars
   ```
4. Deploy automatically ho jata hai!
5. Railway tumhe ek URL deta hai jaise: https://all-in-one-ai-production.up.railway.app

### Step 3: Frontend Vercel pe deploy karo
1. vercel.com pe jao → "New Project"
2. apna GitHub repo import karo
3. Root directory: `frontend` set karo
4. Environment variable add karo:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
5. Deploy!

## Paise Kamane Ka Plan 💰

### Free Tier Limits
- Railway: $5/month credit (free mein kaafi hai start ke liye)
- Vercel: Unlimited hobby projects (free)
- Total cost: $0 start mein

### Revenue Model
1. **Subscriptions** (Stripe ke zariye):
   - Free: $0 (50K tokens)
   - Starter: $19/mo
   - Pro: $49/mo
   - Business: $149/mo

2. **Marketplace Commission**: 30% from every sale
3. **API Reselling**: Mark up AI API costs 2-3x

### Scale karne par costs
- 1,000 users → Railway ~$25/mo → Revenue $19K+/mo
- 10,000 users → Railway + DB ~$200/mo → Revenue $190K+/mo

## Render.com Alternative (Also Free)

1. render.com → "New Web Service"
2. GitHub repo connect karo
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `node src/index.js`
6. Env vars daalo
7. Deploy!

## Custom Domain Lagana

Railway mein:
- Settings → Domains → Custom Domain
- Apna domain: allinone-ai.com (namecheap se ~$10/year)
- DNS mein CNAME add karo

## Stripe Setup (Paise Lene Ke Liye)

1. stripe.com pe account banao
2. Products banao (Starter $19, Pro $49, Business $149)
3. Price IDs copy karo
4. Railway env mein daalo:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_STARTER_PRICE_ID=price_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_BUSINESS_PRICE_ID=price_...
   ```
