import { NextRequest, NextResponse } from "next/server";
import { Account, RpcProvider, CallData, hash } from "starknet";

const ROUTE_GUARD_ADDRESS = process.env.NEXT_PUBLIC_ROUTEGUARD_ADDRESS || "0x0";

const EVENT_TYPE_VARIANTS = [
  "Accident", "RoadClosure", "Protest", "PoliceActivity", "Hazard", "TrafficJam",
] as const;

function isDemoMode() {
  const key = process.env.RELAYER_PRIVATE_KEY;
  const addr = process.env.RELAYER_ADDRESS;
  const contract = ROUTE_GUARD_ADDRESS;
  return !key || key === "0x0" || !addr || addr === "0x0" || contract === "0x0";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitment, latitude, longitude, eventType } = body;

    if (!commitment || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (eventType < 0 || eventType > 5) {
      return NextResponse.json({ error: "Invalid eventType (0-5)" }, { status: 400 });
    }

    // Demo mode: return mock success when contract/relayer not deployed
    if (isDemoMode()) {
      const fakeTxHash = hash.computePedersenHash(commitment, Date.now().toString());
      
      // Save to localStorage-compatible demo store
      console.log(`[Relayer DEMO] Mock TX: ${fakeTxHash} | commitment: ${commitment}`);

      return NextResponse.json({
        success: true,
        txHash: fakeTxHash,
        demoMode: true,
        relayerAddress: "0x04d3m0_relayer",
        message: "⚡ DEMO MODE — Report recorded locally. In production, this submits to Starknet via relayer.",
        commitment,
        eventType: EVENT_TYPE_VARIANTS[eventType],
        location: { latitude, longitude },
      });
    }

    // Production mode
    const relayerKey = process.env.RELAYER_PRIVATE_KEY!;
    const relayerAddress = process.env.RELAYER_ADDRESS!;

    const provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io",
    });

    const account = new Account({ provider, address: relayerAddress, signer: relayerKey });

    const latScaled = Math.round(latitude * 1e8);
    const lngScaled = Math.round(longitude * 1e8);

    const variantName = EVENT_TYPE_VARIANTS[eventType];
    const calldata = CallData.compile({
      commitment,
      latitude: latScaled.toString(),
      longitude: lngScaled.toString(),
      event_type: { variant: { [variantName]: {} } },
    });

    const result = await account.execute([
      {
        contractAddress: ROUTE_GUARD_ADDRESS,
        entrypoint: "submit_report",
        calldata,
      },
    ]);

    console.log(`[Relayer] TX: ${result.transaction_hash}`);
    await provider.waitForTransaction(result.transaction_hash);

    return NextResponse.json({
      success: true,
      txHash: result.transaction_hash,
      demoMode: false,
      relayerAddress: account.address,
      message: "Report submitted anonymously via relayer",
    });
  } catch (error: any) {
    console.error("[Relayer] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to relay transaction" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      status: "demo",
      message: "Running in demo mode — contract not deployed",
      contract: ROUTE_GUARD_ADDRESS,
      network: "starknet-sepolia",
    });
  }

  return NextResponse.json({
    status: "active",
    relayerAddress: process.env.RELAYER_ADDRESS,
    contract: ROUTE_GUARD_ADDRESS,
    network: "starknet-sepolia",
  });
}
