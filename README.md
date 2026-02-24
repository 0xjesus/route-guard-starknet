# 🛡️ RouteGuard — STARK-Powered Anonymous Road Safety

> **Re{define} Hackathon 2026 — Privacy Track Submission**
>
> _Privacy and public safety aren't mutually exclusive._

<p align="center">
  <strong>Built on Starknet</strong> · Pedersen Commitments · Nullifier System · Relayer Architecture
</p>

---

## 🔴 The Problem

Current road incident reporting apps (Waze, Google Maps, citizen apps) **require user accounts and expose your identity**. Reporting police checkpoints, protests, or hazards can put reporters at risk — especially in regions with surveillance or authoritarian oversight.

**Your identity should never be the price of keeping your community safe.**

## 🟢 The Solution

**RouteGuard** enables fully anonymous road incident reporting using Starknet's native cryptographic primitives:

- **No wallet needed to report** — a relayer submits transactions on your behalf
- **Pedersen commitments** — your identity is cryptographically hidden on-chain
- **Nullifier system** — prevents double-claims without revealing who you are
- **Secret passphrase** — only you can claim rewards, via any wallet address
- **Community validation** — reports gain trust through decentralized confirmation

---

## 🔒 Privacy Architecture

This is the core of our Privacy Track submission. RouteGuard implements **four layers of privacy** using Starknet-native primitives:

### Layer 1: Pedersen Commitment Scheme

```
Reporter generates:
  secret = starknetKeccak(passphrase)
  salt   = starknetKeccak(passphrase + "_salt")
  commitment = pedersen(secret, salt)    ← This goes on-chain
                                           Identity stays OFF-chain
```

The Pedersen hash is a **native Starknet builtin** — it's computed inside the STARK VM itself, making it the most efficient hash available on the network. The commitment is:
- **Binding**: You can't find two different (secret, salt) pairs that produce the same commitment
- **Hiding**: Given the commitment, you can't recover the secret or salt

### Layer 2: Relayer Architecture

```
┌──────────────┐     POST /api/relay     ┌──────────────┐     execute()     ┌──────────────┐
│   Reporter   │ ──────────────────────▶ │   Relayer    │ ────────────────▶ │   Starknet   │
│              │   commitment only       │   (API)      │   relayer's acct  │   Contract   │
│  No wallet   │   no IP logging         │              │                   │              │
│  connected   │                         │  Strips all  │                   │  Only stores │
│              │                         │  metadata    │                   │  commitment  │
└──────────────┘                         └──────────────┘                   └──────────────┘
```

The reporter **never connects a wallet** to submit reports. The relayer API:
- Receives only the Pedersen commitment + location + event type
- Submits the transaction using the relayer's own Starknet account
- Does not log IPs or any identifying metadata
- The on-chain transaction shows the relayer as `msg.sender`, not the reporter

### Layer 3: Nullifier System

```
When claiming rewards:
  nullifier = pedersen(secret, report_id)

Properties:
  ✓ Unique per (secret, report_id) pair
  ✓ Contract checks: nullifier not previously used
  ✓ Cannot derive secret from nullifier (Pedersen is one-way)
  ✓ Cannot link two nullifiers to the same reporter
```

The nullifier system prevents double-claims **without revealing identity**:
- Each claim produces a unique nullifier from the reporter's secret
- The contract rejects any previously-used nullifier
- Observers cannot correlate nullifiers to determine if two claims came from the same person
- This is the same pattern used in Tornado Cash and Zcash

### Layer 4: Unlinkable Reward Claims

```
Claim flow:
  1. Reporter enters passphrase → derives (secret, salt, nullifier)
  2. Contract verifies: pedersen(secret, salt) == stored commitment ✓
  3. Contract verifies: nullifier not used ✓
  4. Rewards sent to ANY address reporter specifies
  5. No link between reporting identity and claim address
```

### Security Properties

| Property | How It's Achieved |
|----------|-------------------|
| **Reporter Anonymity** | Pedersen commitment hides identity; relayer submits tx |
| **Unlinkable Claims** | Claim to any address; nullifier prevents correlation |
| **No Double-Claims** | Nullifier = pedersen(secret, report_id) checked on-chain |
| **Anti-Spam** | Minimum stake requirement per report |
| **Sybil Resistance** | Community confirmation threshold (3 validators) |
| **Malicious Report Protection** | Owner can slash reports; stake is forfeited |
| **Commitment Binding** | Pedersen hash is collision-resistant |
| **Forward Secrecy** | Even if relayer is compromised, past reports remain anonymous |

### Why Not Just Use a VPN?

| Approach | Problem |
|----------|---------|
| **VPN** | Still need a user account; platform can be subpoenaed; metadata leaks |
| **Anonymous email** | Platform still controls data; no crypto-economic incentives |
| **RouteGuard** | No account needed; identity protected by math (Pedersen); trustless reward system |

The key insight: **VPNs hide your IP, but RouteGuard hides your identity at the protocol level.** Even if the relayer server is fully compromised, past reports remain anonymous because the relayer never had the reporter's identity in the first place.

---

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
│  │                                                   │    │
│  │  submit_report(commitment, lat, lng, type)        │    │
│  │  submit_private_report(... + encrypted_type)      │    │
│  │  confirm_report(id) — community validation        │    │
│  │  send_regards(id, amount) — reward reporters      │    │
│  │  claim_rewards(secret, salt, nullifier, recipient)│    │
│  │  expire_report(id) / slash_report(id)             │    │
│  │                                                   │    │
│  │  is_nullifier_used(nullifier) → bool              │    │
│  │  verify_nullifier(secret, report_id) → felt252    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Storage: Reports, Rewards, Nullifiers, Slashed          │
│  Privacy: Only Pedersen commitment stored on-chain       │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                 REWARD CLAIMING                           │
│  1. Enter passphrase → derives (secret, salt)            │
│  2. Generate nullifier = pedersen(secret, report_id)     │
│  3. Contract verifies commitment + nullifier uniqueness  │
│  4. Rewards sent to any address of your choice           │
│  (No link between reporter identity and claim address)   │
└──────────────────────────────────────────────────────────┘
```

---

## 🌟 Why Starknet?

Starknet is the ideal platform for privacy-preserving applications:

1. **Native Pedersen Hash** — First-class builtin in the Cairo VM. No external libraries, no extra gas. `core::pedersen::pedersen` is the most efficient hash on the network.

2. **STARK Validity Proofs** — Every transaction is backed by a STARK proof of computational integrity. This means the contract logic is **provably correct** — you don't need to trust the sequencer.

3. **Account Abstraction** — Native AA makes the relayer pattern elegant. The relayer submits transactions using its own account, and Starknet's AA ensures proper authorization.

4. **Low Fees** — L2 gas costs make micro-stakes and community validation economically viable. Reporting an incident costs fractions of a cent.

5. **Cairo's Type Safety** — Cairo's strong type system catches errors at compile time. Enum variants for event types, felt252 for hashes — the type system matches the cryptographic primitives.

6. **Growing Ecosystem** — ArgentX and Braavos wallets provide excellent UX for claiming rewards. Starkscan provides transparent verification of all on-chain activity.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Cairo (Starknet), OpenZeppelin Components |
| Hashing | Pedersen Hash (native Starknet builtin) |
| Privacy | Nullifier system, Pedersen commitments, Relayer |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Wallet | starknet-react (ArgentX, Braavos) |
| Contract Interaction | starknet.js v6 |
| Maps | Google Maps API (dark theme) |
| Animations | Framer Motion |
| Deployment | Vercel (frontend), Starknet Sepolia (contract) |

---

## 🔄 How It Works

### Reporting (Anonymous)
1. **Choose incident** — Select from 6 event types (Accident, Road Closure, Protest, Police Activity, Hazard, Traffic Jam)
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
3. Nullifier generated: `pedersen(secret, report_id)` — prevents double-claim
4. Rewards sent to any address you specify
5. **No link** between your reporting identity and claim address

---

## 📋 Event Types

| Type | Icon | Description |
|------|------|-------------|
| Accident | 🚗 | Vehicle collision or accident |
| Road Closure | 🚧 | Road closed or blocked |
| Protest | 📢 | Protest or demonstration |
| Police Activity | 🚔 | Police checkpoint or activity |
| Hazard | ⚠️ | Road hazard or danger |
| Traffic Jam | 🚦 | Heavy traffic congestion |

---

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

---

## 📁 Project Structure

```
route-guard-starknet/
├── contracts/
│   ├── src/
│   │   ├── lib.cairo
│   │   └── route_guard.cairo     # Main contract with nullifier system
│   └── Scarb.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/relay/report/route.ts  # Relayer API
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── dashboard/Dashboard.tsx    # Privacy badge
│   │   │   ├── landing/HeroSection.tsx    # Privacy architecture section
│   │   │   ├── map/GoogleMapView.tsx
│   │   │   ├── providers/StarknetProvider.tsx
│   │   │   └── sheets/
│   │   │       ├── ReportSheet.tsx        # Privacy shield indicator
│   │   │       ├── ConfirmSheet.tsx
│   │   │       └── RewardsSheet.tsx       # Nullifier-based claims
│   │   ├── hooks/useRouteGuard.ts         # Real starknet.js calls
│   │   └── lib/
│   │       ├── contracts/routeGuardAbi.ts
│   │       ├── pedersen.ts                # Pedersen + nullifier generation
│   │       └── utils.ts
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.ts
├── .gitignore
├── vercel.json
└── README.md
```

---

## 🏆 Re{define} Hackathon 2026 — Privacy Track

RouteGuard demonstrates that **privacy and public safety aren't mutually exclusive**. By combining Starknet's native Pedersen commitments with a nullifier system and relayer architecture, we enable anyone to contribute to road safety without risking their identity.

### What makes this a Privacy Track submission:

1. **Pedersen commitments** (native Starknet builtin) — hide reporter identity
2. **Nullifier system** — prevents double-claims without identity revelation
3. **Relayer architecture** — removes wallet linkage from on-chain data
4. **Encrypted event types** — optional encryption for sensitive report types
5. **Unlinkable reward claims** — claim to any address, breaking the identity chain

### The privacy guarantee:

> Even if an adversary controls the Starknet sequencer, the relayer server, AND monitors all network traffic — they still cannot determine who submitted a specific report, because the Pedersen commitment is mathematically hiding.

---

## 📄 License

MIT
