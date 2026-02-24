# 🛡️ RouteGuard — Anonymous Road Incident Reporting on Starknet

> **Re{define} Hackathon 2026 — Privacy Track**

## 🔴 The Problem

Current road incident reporting apps (Waze, Google Maps, citizen apps) **require user accounts and expose your identity**. Reporting police checkpoints, protests, or hazards can put reporters at risk — especially in regions with surveillance or authoritarian oversight.

**Your identity should never be the price of keeping your community safe.**

## 🟢 The Solution

**RouteGuard** enables fully anonymous road incident reporting using Starknet's native Pedersen hash commitments and a relayer architecture:

- **No wallet needed to report** — a relayer submits transactions on your behalf
- **Pedersen commitments** — your identity is cryptographically hidden on-chain
- **Secret passphrase** — only you can claim rewards, without ever revealing who you are
- **Community validation** — reports gain trust through decentralized confirmation

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     USER (Reporter)                       │
│  1. Select incident type & location on map               │
│  2. Generate passphrase → Pedersen commitment            │
│  3. Send to relayer (no wallet connection needed)        │
└──────────────────────┬───────────────────────────────────┘
                       │ POST /api/relay/report
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   RELAYER (Next.js API)                   │
│  • Receives: commitment, lat/lng, event_type             │
│  • Submits tx using relayer's Starknet account           │
│  • Reporter's wallet/IP never touches the chain          │
└──────────────────────┬───────────────────────────────────┘
                       │ account.execute()
                       ▼
┌──────────────────────────────────────────────────────────┐
│              STARKNET (Cairo Smart Contract)              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  RouteGuard Contract                             │    │
│  │  • submit_report(commitment, lat, lng, type)     │    │
│  │  • confirm_report(id) — community validation     │    │
│  │  • send_regards(id, amount) — reward reporters   │    │
│  │  • claim_rewards(secret, salt, recipient)        │    │
│  │  • expire_report(id) / slash_report(id)          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Storage: Reports Map, Rewards Map, Slashed Map          │
│  Privacy: Only Pedersen commitment stored on-chain       │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                 REWARD CLAIMING                           │
│  1. Enter passphrase → derives (secret, salt)            │
│  2. Contract verifies: pedersen(secret, salt) == commit  │
│  3. Rewards sent to any address of your choice           │
│  (No link between reporter identity and claim address)   │
└──────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Cairo (Starknet), OpenZeppelin Components |
| Hashing | Pedersen Hash (native Starknet primitive) |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Wallet | starknet-react (ArgentX, Braavos) |
| Contract Interaction | starknet.js v6 |
| Maps | Google Maps API (dark theme) |
| Animations | Framer Motion |
| Deployment | Vercel (frontend), Starknet Sepolia (contract) |

## 🔄 How It Works

### Reporting (Anonymous)
1. **Choose incident** — Select from 6 event types
2. **Pick location** — Tap the map or enter coordinates
3. **Generate passphrase** — 4 random words (e.g., `alpha-bravo-carbon-delta`)
4. **Commitment created** — `pedersen(keccak(passphrase), keccak(passphrase + "_salt"))`
5. **Relayer submits** — Transaction sent from relayer account, not yours
6. **Save passphrase** — This is the ONLY way to claim rewards later

### Validating (Community)
1. Browse active reports on the map
2. Click "Confirm" if you can verify the incident
3. After 3 confirmations, report is auto-confirmed
4. Reporter's stake is returned to their reward pool

### Claiming Rewards (Anonymous)
1. Enter your passphrase
2. Contract derives commitment from your secret
3. Rewards sent to any address you specify
4. **No link** between your reporting identity and claim address

## 📋 Event Types

| Type | Icon | Description |
|------|------|-------------|
| Accident | 🚗 | Vehicle collision or accident |
| Road Closure | 🚧 | Road closed or blocked |
| Protest | 📢 | Protest or demonstration |
| Police Activity | 🚔 | Police checkpoint or activity |
| Hazard | ⚠️ | Road hazard or danger |
| Traffic Jam | 🚦 | Heavy traffic congestion |

## 🔒 Security Properties

| Property | Implementation |
|----------|---------------|
| **Reporter Anonymity** | Pedersen commitment hides identity; relayer submits tx |
| **Unlinkable Claims** | Claim to any address; no on-chain link to report submission |
| **Anti-Spam** | Minimum stake requirement per report |
| **Sybil Resistance** | Community confirmation threshold (3 validators) |
| **Malicious Report Protection** | Owner can slash reports; stake is forfeited |
| **Commitment Binding** | Pedersen hash is collision-resistant; can't fake ownership |
| **No IP Logging** | Relayer API doesn't store IP or metadata |

## 🚀 Quick Start

### Prerequisites
- [Scarb](https://docs.swmansion.com/scarb/) (Cairo package manager)
- Node.js 18+
- Starknet wallet (ArgentX or Braavos) for validation/rewards

### 1. Build Smart Contract
```bash
cd contracts
scarb build
```

### 2. Deploy Contract (Starknet Sepolia)
```bash
# Using starkli or sncast
starkli declare target/dev/route_guard_RouteGuard.contract_class.json
starkli deploy <CLASS_HASH> <OWNER_ADDRESS>
```

### 3. Run Frontend
```bash
cd frontend
cp .env.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_ROUTEGUARD_ADDRESS=0x_deployed_contract
RELAYER_PRIVATE_KEY=0x_relayer_key
RELAYER_ADDRESS=0x_relayer_address
STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
```

## 🌟 Why Starknet?

1. **Native Pedersen Hash** — First-class primitive in Cairo, no external libraries needed
2. **Low Cost** — L2 gas fees make micro-stakes and community validation economically viable
3. **Cairo's Type Safety** — Strong typing catches errors at compile time
4. **Account Abstraction** — Native AA enables seamless relayer patterns
5. **Growing Ecosystem** — ArgentX, Braavos wallets provide excellent UX
6. **STARK Proofs** — Mathematical guarantees of computation integrity

## 📁 Project Structure

```
route-guard-starknet/
├── contracts/
│   ├── src/
│   │   ├── lib.cairo
│   │   └── route_guard.cairo     # Main contract
│   └── Scarb.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/relay/report/route.ts  # Relayer API
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── dashboard/Dashboard.tsx
│   │   │   ├── landing/HeroSection.tsx
│   │   │   ├── map/GoogleMapView.tsx
│   │   │   ├── providers/StarknetProvider.tsx
│   │   │   └── sheets/
│   │   │       ├── ReportSheet.tsx
│   │   │       ├── ConfirmSheet.tsx
│   │   │       └── RewardsSheet.tsx
│   │   ├── hooks/useRouteGuard.ts
│   │   └── lib/
│   │       ├── contracts/routeGuardAbi.ts
│   │       ├── pedersen.ts
│   │       └── utils.ts
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.ts
├── .gitignore
├── vercel.json
└── README.md
```

## 🏆 Hackathon

**Re{define} Hackathon 2026 — Privacy Track**

RouteGuard demonstrates that **privacy and public safety aren't mutually exclusive**. By combining Starknet's Pedersen commitments with a relayer architecture, we enable anyone to contribute to road safety without risking their identity.

## 📄 License

MIT
