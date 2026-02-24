"use client";

import { useContract, useReadContract, useSendTransaction } from "@starknet-react/core";
import { ROUTE_GUARD_ABI, ROUTE_GUARD_ADDRESS } from "@/lib/contracts/routeGuardAbi";
import { useCallback } from "react";
import { CallData } from "starknet";

export function useRouteGuardContract() {
  const { contract } = useContract({
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
  });
  return contract;
}

export function useReportCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    functionName: "get_report_count",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: [],
  });
  return { count: data as bigint | undefined, isLoading, error, refetch };
}

export function useReport(reportId: bigint | undefined) {
  const { data, isLoading, error } = useReadContract({
    functionName: "get_report",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: reportId !== undefined ? [reportId] : undefined,
  });
  return { report: data, isLoading, error };
}

export function useMinStake() {
  const { data, isLoading } = useReadContract({
    functionName: "get_min_stake",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: [],
  });
  return { minStake: data as bigint | undefined, isLoading };
}

export function usePendingRewards(commitment: string | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    functionName: "get_pending_rewards",
    abi: ROUTE_GUARD_ABI,
    address: ROUTE_GUARD_ADDRESS as `0x${string}`,
    args: commitment ? [commitment] : undefined,
  });
  return { rewards: data as bigint | undefined, isLoading, refetch };
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
    async (secret: string, salt: string, recipient: string) => {
      return sendAsync([
        {
          contractAddress: ROUTE_GUARD_ADDRESS,
          entrypoint: "claim_rewards",
          calldata: CallData.compile({ secret, salt, recipient }),
        },
      ]);
    },
    [sendAsync]
  );

  return { claim, isPending, error };
}
