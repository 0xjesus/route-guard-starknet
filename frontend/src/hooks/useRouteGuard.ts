"use client";

import { useContract, useReadContract, useSendTransaction } from "@starknet-react/core";
import { ROUTE_GUARD_ABI, ROUTE_GUARD_ADDRESS } from "@/lib/contracts/routeGuardAbi";
import { useCallback, useMemo } from "react";
import { CallData } from "starknet";

const IS_DEMO = ROUTE_GUARD_ADDRESS === "0x0" || !ROUTE_GUARD_ADDRESS;

export function useRouteGuardContract() {
  const { contract } = useContract({
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
  });
  return IS_DEMO ? null : contract;
}

export function useReportCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    functionName: "get_report_count",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: [],
    enabled: !IS_DEMO,
  } as any);

  if (IS_DEMO) {
    return { count: BigInt(42), isLoading: false, error: undefined, refetch: () => {} };
  }
  return { count: data as bigint | undefined, isLoading, error, refetch };
}

export function useReport(reportId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    functionName: "get_report",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: reportId !== undefined ? [reportId] : undefined,
    enabled: !IS_DEMO && reportId !== undefined,
  } as any);

  if (IS_DEMO && reportId !== undefined) {
    return {
      report: {
        commitment: "0xdemo",
        latitude: "194326000",
        longitude: "-991332000",
        event_type: { variant: { Accident: {} } },
        status: { variant: { Active: {} } },
        timestamp: BigInt(Math.floor(Date.now() / 1000) - 3600),
        expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400),
        stake: BigInt(0),
        regards: BigInt(0),
        confirmations: 3,
      },
      isLoading: false,
      error: undefined,
    };
  }
  return { report: data, isLoading, error };
}

export function useMinStake() {
  const { data, isLoading } = useReadContract({
    functionName: "get_min_stake",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: [],
    enabled: !IS_DEMO,
  } as any);

  if (IS_DEMO) return { minStake: BigInt(0), isLoading: false };
  return { minStake: data as bigint | undefined, isLoading };
}

export function usePendingRewards(commitment: string | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    functionName: "get_pending_rewards",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: commitment ? [commitment] : undefined,
    enabled: !IS_DEMO && !!commitment,
  } as any);

  if (IS_DEMO && commitment) {
    return {
      rewards: BigInt("50000000000000000"), // 0.05 ETH demo
      isLoading: false,
      refetch: () => {},
    };
  }
  return { rewards: data as bigint | undefined, isLoading, refetch };
}

export function useIsNullifierUsed(nullifier: string | undefined) {
  const { data, isLoading } = useReadContract({
    functionName: "is_nullifier_used",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: nullifier ? [nullifier] : undefined,
    enabled: !IS_DEMO && !!nullifier,
  } as any);

  if (IS_DEMO) return { isUsed: false, isLoading: false };
  return { isUsed: data as boolean | undefined, isLoading };
}

const EVENT_NAMES = ["Accident", "RoadClosure", "Protest", "PoliceActivity", "Hazard", "TrafficJam"] as const;

export function useSubmitReport() {
  const { sendAsync, isPending, error } = useSendTransaction({});

  const submit = useCallback(
    async (commitment: string, latitude: string, longitude: string, eventType: number) => {
      const calldata = CallData.compile({
        commitment,
        latitude,
        longitude,
        event_type: { variant: { [EVENT_NAMES[eventType]]: {} } },
      });

      return sendAsync([
        {
          contractAddress: ROUTE_GUARD_ADDRESS,
          entrypoint: "submit_report",
          calldata,
        },
      ]);
    },
    [sendAsync]
  );

  return { submit, isPending, error };
}

export function useConfirmReport() {
  const { sendAsync, isPending, error } = useSendTransaction({});

  const confirm = useCallback(
    async (reportId: bigint) => {
      if (IS_DEMO) {
        // Simulate delay
        await new Promise((r) => setTimeout(r, 1500));
        return { transaction_hash: "0xdemo_confirm_" + reportId.toString(16) };
      }
      return sendAsync([
        {
          contractAddress: ROUTE_GUARD_ADDRESS,
          entrypoint: "confirm_report",
          calldata: CallData.compile({ report_id: reportId }),
        },
      ]);
    },
    [sendAsync]
  );

  return { confirm, isPending, error };
}

export function useSendRegards() {
  const { sendAsync, isPending, error } = useSendTransaction({});

  const sendRegards = useCallback(
    async (reportId: bigint, amount: bigint) => {
      if (IS_DEMO) {
        await new Promise((r) => setTimeout(r, 1500));
        return { transaction_hash: "0xdemo_regards" };
      }
      return sendAsync([
        {
          contractAddress: ROUTE_GUARD_ADDRESS,
          entrypoint: "send_regards",
          calldata: CallData.compile({ report_id: reportId, amount }),
        },
      ]);
    },
    [sendAsync]
  );

  return { sendRegards, isPending, error };
}

export function useClaimRewards() {
  const { sendAsync, isPending, error } = useSendTransaction({});

  const claim = useCallback(
    async (secret: string, salt: string, nullifier: string, recipient: string) => {
      if (IS_DEMO) {
        await new Promise((r) => setTimeout(r, 2000));
        return { transaction_hash: "0xdemo_claim" };
      }
      return sendAsync([
        {
          contractAddress: ROUTE_GUARD_ADDRESS,
          entrypoint: "claim_rewards",
          calldata: CallData.compile({ secret, salt, nullifier, recipient }),
        },
      ]);
    },
    [sendAsync]
  );

  return { claim, isPending, error };
}
