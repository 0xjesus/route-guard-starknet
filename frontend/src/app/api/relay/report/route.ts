import { NextRequest, NextResponse } from "next/server";
import { Account, RpcProvider, Contract, CallData, hash } from "starknet";

const ROUTE_GUARD_ADDRESS = process.env.NEXT_PUBLIC_ROUTEGUARD_ADDRESS || "0x0";

const ROUTE_GUARD_ABI = [
  {
    type: "function",
    name: "submit_report",
    inputs: [
      { name: "commitment", type: "core::felt252" },
      { name: "latitude", type: "core::felt252" },
      { name: "longitude", type: "core::felt252" },
      { name: "event_type", type: "route_guard::route_guard::EventType" },
    ],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "external",
  },
] as const;

const EVENT_TYPE_VARIANTS = [
  "Accident", "RoadClosure", "Protest", "PoliceActivity", "Hazard", "TrafficJam",
] as const;

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

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerAddress = process.env.RELAYER_ADDRESS;
    if (!relayerKey || !relayerAddress) {
      return NextResponse.json({ error: "Relayer not configured" }, { status: 500 });
    }

    const provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io",
    });

    const account = new Account({
      provider,
      address: relayerAddress,
      signer: relayerKey,
    });

    // Scale coordinates by 1e8
    const latScaled = Math.round(latitude * 1e8);
    const lngScaled = Math.round(longitude * 1e8);

    // Build the call
    const variantName = EVENT_TYPE_VARIANTS[eventType];
    const calldata = CallData.compile({
      commitment,
      latitude: latScaled >= 0 ? latScaled.toString() : latScaled.toString(),
      longitude: lngScaled >= 0 ? lngScaled.toString() : lngScaled.toString(),
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
  const relayerKey = process.env.RELAYER_PRIVATE_KEY;
  const relayerAddress = process.env.RELAYER_ADDRESS;

  if (!relayerKey || !relayerAddress) {
    return NextResponse.json({ status: "not_configured" });
  }

  try {
    const provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || "https://starknet-sepolia.public.blastapi.io",
    });

    return NextResponse.json({
      status: "active",
      relayerAddress,
      contract: ROUTE_GUARD_ADDRESS,
      network: "starknet-sepolia",
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message });
  }
}
