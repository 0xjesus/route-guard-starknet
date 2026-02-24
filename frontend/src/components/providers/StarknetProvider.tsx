"use client";

import { ReactNode } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, argent, braavos, starkscan } from "@starknet-react/core";

const chains = [sepolia, mainnet];
const connectors = [argent(), braavos()];

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig
      chains={chains}
      provider={publicProvider()}
      connectors={connectors}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
