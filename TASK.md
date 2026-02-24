# RouteGuard Starknet - Build Task

## Context
This is a port of RoadGuard (anonymous road incident reporting) from Mantle/Solidity to **Starknet** for the **Re{define} Hackathon 2026 Privacy Track**.

Original repo for reference: https://github.com/0xjesus/route-guard (Mantle, Solidity, Next.js)

## What to Build

### 1. Cairo Smart Contract (contracts/)
Port the RoadGuard contract to Cairo on Starknet. Use REAL Starknet privacy primitives:

- **Pedersen hash** (native to Starknet) for commitments instead of keccak256
- **Commit-reveal scheme** for anonymous reporting
- Same core logic: submitReport, confirmReport, sendRegards, claimRewards, slashReport
- Event types: Accident, RoadClosure, Protest, PoliceActivity, Hazard, TrafficJam
- Use Scarb for project management
- Use OpenZeppelin Cairo contracts where applicable (OwnableComponent, ReentrancyGuardComponent)
- Deploy to Starknet Sepolia testnet
- Include comprehensive tests

### 2. Frontend (frontend/) - Next.js 15 + App Router
- **starknet-react** + **starknet.js** for wallet connection (ArgentX, Braavos)
- **Dark carbon aesthetic** - ultra dark (#0a0a0a, #111, #1a1a1a), carbon fiber textures, subtle glow accents in teal/cyan
- Google Maps integration with dark theme for incident reporting
- Route planning with hazard detection
- Anonymous report submission flow
- Community validation (confirm reports)
- Rewards system (send regards, claim rewards)
- Responsive, mobile-first
- Use Tailwind CSS, Framer Motion for animations
- NO MOCKED DATA - everything connects to real Starknet contracts

### 3. Branding
- Name: **RouteGuard** (or Route Guard)
- Tagline: "Anonymous Road Safety on Starknet"
- Color palette: Ultra dark carbon (#0a0a0a base), teal/cyan accents (#00d4aa, #0ea5e9), subtle gradients
- Logo: Shield + route icon, minimalist
- Font: Inter or similar clean sans-serif
- Carbon fiber / dark mesh background textures
- Starknet branding integration (powered by Starknet)

### 4. Privacy Architecture (REAL, not mocked)
- User generates secret passphrase locally
- Pedersen hash commitment (native Starknet)  
- Relayer API submits transactions (user wallet never on-chain)
- Commit-reveal for reward claims
- This fits the Privacy Track perfectly: "Build privacy-preserving applications using STARKs"

### 5. Tech Stack
- **Smart Contracts**: Cairo 2.x, Scarb, OpenZeppelin Cairo
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, starknet-react, starknet.js
- **Maps**: Google Maps API (dark theme)
- **Database**: Neon Postgres (Drizzle ORM) for caching on-chain data
- **Deploy**: Vercel (frontend) + Starknet Sepolia (contracts)

### 6. Project Structure
```
route-guard-starknet/
├── contracts/
│   ├── src/
│   │   └── route_guard.cairo
│   ├── tests/
│   │   └── test_route_guard.cairo
│   └── Scarb.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── README.md
└── .gitignore
```

### 7. README.md
Write a hackathon-winning README similar to the original but for Starknet:
- Problem statement
- Solution with privacy architecture diagram
- Tech stack
- How it works (step by step)
- Screenshots/demo
- Deployment instructions
- Why Starknet (STARK proofs, native Pedersen, low fees, scalability)
- Team info

### 8. Deliverables for Hackathon
- GitHub repo with code
- Live demo on Vercel
- Contract deployed on Starknet Sepolia
- README with architecture docs

## Important Notes
- NO MOCKED FUNCTIONALITY. Real Starknet integration.
- If you can't deploy the contract (need keys), set up everything so deployment is one command away with `starkli`
- For Google Maps API key, use env var NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- For relayer, use env var RELAYER_PRIVATE_KEY (Starknet account)
- Make the UI STUNNING - dark carbon theme, smooth animations, professional
- This needs to WIN the Privacy Track ($9,675)

## Git
- Repo is at /tmp/route-guard-starknet
- Remote: https://github.com/0xjesus/route-guard-starknet
- Commit and push when done

When completely finished, run this command to notify:
openclaw system event --text "Done: RouteGuard Starknet project complete - Cairo contracts + Next.js frontend with dark carbon branding ready for hackathon" --mode now
