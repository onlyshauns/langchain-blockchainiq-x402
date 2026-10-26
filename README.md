# langchain-blockchainiq-x402
LangChain tool that makes **paid x402 calls** to Blockchain IQ (`brief` $0.01, `event-risk` $0.05), paying USDC on Base (eip155:8453) with `@x402/fetch` + `@x402/evm`. No API key, no account.

```bash
npm i
X402_PRIVATE_KEY=0x<throwaway key with ≥$0.05 USDC on Base> node demo.mjs brief
```
```js
import { createBlockchainIQTool } from "./index.mjs";
const tool = createBlockchainIQTool();            // bind into any LangChain agent: agent.tools=[tool]
await tool.invoke({ resource: "brief" });         // -> {status, settlement:{transaction,...}, data}
```
No gas needed: x402 "exact" uses an EIP-3009 signed authorization; the facilitator settles. Settlement proof (tx hash) is decoded from the `PAYMENT-RESPONSE` header. MIT.
