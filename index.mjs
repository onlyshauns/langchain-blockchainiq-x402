// LangChain tool: paid x402 calls to Blockchain IQ (brief $0.01, event-risk $0.05), USDC on Base.
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { privateKeyToAccount } from "viem/accounts";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment, x402Client, decodePaymentResponseHeader } from "@x402/fetch";

const BASE = "https://www.blockchainiq.co/api/x402/v1";

export function createBlockchainIQTool({ privateKey = process.env.X402_PRIVATE_KEY, maxUsd = 0.05 } = {}) {
  if (!privateKey) throw new Error("Set X402_PRIVATE_KEY (a throwaway wallet holding a few cents of USDC on Base)");
  const signer = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);
  const client = new x402Client();
  client.register("eip155:8453", new ExactEvmScheme(signer));
  const payFetch = wrapFetchWithPayment(fetch, client);
  return tool(async ({ resource }) => {
    if (resource === "event-risk" && maxUsd < 0.05) throw new Error("event-risk costs $0.05; raise maxUsd");
    const res = await payFetch(`${BASE}/${resource}`);
    const body = await res.json();
    const hdr = res.headers.get("PAYMENT-RESPONSE") || res.headers.get("X-PAYMENT-RESPONSE");
    const settlement = hdr ? decodePaymentResponseHeader(hdr) : null;
    return JSON.stringify({ status: res.status, settlement, data: body });
  }, {
    name: "blockchain_iq",
    description: "Paid crypto market data from Blockchain IQ via x402 (USDC on Base). 'brief' ($0.01): BTC/ETH/SOL/XRP prices+moves, events next 48h, risk flags. 'event-risk' ($0.05): macro/central-bank/crypto events 7 days ahead.",
    schema: z.object({ resource: z.enum(["brief", "event-risk"]).default("brief") }),
  });
}
