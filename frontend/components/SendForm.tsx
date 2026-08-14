"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, isAddress, parseUnits } from "viem";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Send, ShieldCheck, Wallet } from "lucide-react";
import {
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  FXRP_DECIMALS,
  SEND_CONTRACT_ABI,
  getTxExplorerUrl,
  isContractConfigured,
} from "@/lib/contracts";
import { fetchRate, formatIdr, type RateData } from "@/lib/api";

export function SendForm() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<RateData | null>(null);
  const [rateError, setRateError] = useState(false);

  const contractReady = isContractConfigured(CONTRACT_ADDRESSES.SEND_CONTRACT);
  const correctNetwork = chainId === 114;
  const parsedAmount = useMemo(() => {
    try {
      return amount && Number(amount) > 0 ? parseUnits(amount, FXRP_DECIMALS) : 0n;
    } catch {
      return 0n;
    }
  }, [amount]);

  useEffect(() => {
    fetchRate().then(setRate).catch(() => setRateError(true));
  }, []);

  const { data: balanceRaw, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && correctNetwork) },
  });
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && contractReady ? [address, CONTRACT_ADDRESSES.SEND_CONTRACT] : undefined,
    query: { enabled: Boolean(address && correctNetwork && contractReady) },
  });

  const approval = useWriteContract();
  const sending = useWriteContract();
  const approvalReceipt = useWaitForTransactionReceipt({ hash: approval.data });
  const sendReceipt = useWaitForTransactionReceipt({ hash: sending.data });

  useEffect(() => {
    if (approvalReceipt.isSuccess) void refetchAllowance();
  }, [approvalReceipt.isSuccess, refetchAllowance]);
  useEffect(() => {
    if (sendReceipt.isSuccess) {
      void refetchBalance();
      void refetchAllowance();
    }
  }, [sendReceipt.isSuccess, refetchAllowance, refetchBalance]);

  const balance = balanceRaw ? Number(formatUnits(balanceRaw, FXRP_DECIMALS)) : 0;
  const allowance = allowanceRaw ?? 0n;
  const needsApproval = parsedAmount > allowance;
  const recipientValid = isAddress(recipient) && recipient.toLowerCase() !== address?.toLowerCase();
  const enoughBalance = parsedAmount <= (balanceRaw ?? 0n);
  const busy = approval.isPending || approvalReceipt.isLoading || sending.isPending || sendReceipt.isLoading;
  const idrEstimate = rate && Number(amount) > 0 ? Number(amount) * rate.xrpIdr : null;

  function approve(): void {
    if (!contractReady || parsedAmount <= 0n) return;
    approval.writeContract({
      address: CONTRACT_ADDRESSES.FXRP,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SEND_CONTRACT, parsedAmount],
      chainId: 114,
    });
  }

  function send(): void {
    if (!recipientValid || parsedAmount <= 0n) return;
    sending.writeContract({
      address: CONTRACT_ADDRESSES.SEND_CONTRACT,
      abi: SEND_CONTRACT_ABI,
      functionName: "send",
      args: [recipient as `0x${string}`, parsedAmount],
      chainId: 114,
    });
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-surface-card p-5 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white"><Send className="h-5 w-5 text-flare-bright" />Send FTestXRP</h1>
          <p className="mt-1 text-xs text-slate-400">Approve and transfer through the FlareIt SendContract on Coston2</p>
        </div>
        {isConnected && <div className="text-right"><p className="text-xs text-slate-500">Balance</p><p className="font-mono text-sm font-bold text-white">{balance.toFixed(6)} FXRP</p></div>}
      </div>

      {!isConnected ? (
        <div className="py-10 text-center text-sm text-slate-400"><Wallet className="mx-auto mb-3 h-8 w-8" />Connect your wallet to continue.</div>
      ) : !correctNetwork ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-200">Your wallet is on chain {chainId}. FlareIt only enables transactions on Coston2 (114).</p>
          <button onClick={() => switchChain({ chainId: 114 })} disabled={switching} className="mt-3 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950">Switch to Coston2</button>
        </div>
      ) : !contractReady ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          SendContract is not deployed or configured. Transactions are disabled to prevent writes to an empty address.
        </div>
      ) : (
        <div className="space-y-5">
          <label className="block text-xs font-semibold text-slate-300">
            Recipient address
            <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x..." className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white outline-none focus:border-flare-bright" />
            {recipient && !recipientValid && <span className="mt-2 flex items-center gap-1 text-red-400"><AlertCircle className="h-3 w-3" />Invalid address or same as sender.</span>}
          </label>

          <label className="block text-xs font-semibold text-slate-300">
            FXRP amount
            <div className="relative mt-2">
              <input type="number" min="0" step="0.000001" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.000000" className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 pr-20 font-mono text-sm text-white outline-none focus:border-flare-bright" />
              <button type="button" onClick={() => setAmount(balance.toFixed(6))} className="absolute right-3 top-2.5 rounded bg-slate-800 px-2 py-1 text-[10px] text-white">MAX</button>
            </div>
            {!enoughBalance && <span className="mt-2 flex items-center gap-1 text-red-400"><AlertCircle className="h-3 w-3" />Insufficient balance.</span>}
          </label>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Estimated recipient value</span><span className="font-mono text-white">{idrEstimate ? formatIdr(idrEstimate) : rateError ? "Rate unavailable" : "-"}</span></div>
            <p className="mt-2 text-[10px] text-slate-500">IDR is a reference estimate; the recipient receives FXRP.</p>
          </div>

          <button
            onClick={needsApproval ? approve : send}
            disabled={busy || parsedAmount <= 0n || !enoughBalance || (!needsApproval && !recipientValid)}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold disabled:opacity-40 ${needsApproval ? "bg-amber-400 text-slate-950" : "bg-flare-crimson text-white"}`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : needsApproval ? <ShieldCheck className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {approval.isPending ? "Confirm approval in wallet" : approvalReceipt.isLoading ? "Confirming approval" : sending.isPending ? "Confirm transfer in wallet" : sendReceipt.isLoading ? "Confirming transfer" : needsApproval ? "Approve FXRP (1/2)" : "Send FXRP (2/2)"}
          </button>

          {approval.data && <TxStatus label="Approval" hash={approval.data} success={approvalReceipt.isSuccess} />}
          {sending.data && <TxStatus label="Send" hash={sending.data} success={sendReceipt.isSuccess} />}
          {(approval.error || sending.error) && <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"><AlertCircle className="h-4 w-4" />{(approval.error || sending.error)?.message.slice(0, 180)}</p>}
        </div>
      )}
    </section>
  );
}

function TxStatus({ label, hash, success }: { label: string; hash: `0x${string}`; success: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
      <span className={success ? "flex items-center gap-1 text-emerald-400" : "text-amber-300"}>{success && <CheckCircle2 className="h-4 w-4" />}{label}: {success ? "confirmed" : "pending"}</span>
      <a href={getTxExplorerUrl(hash)} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-flare-bright">{hash.slice(0, 8)}...{hash.slice(-6)}<ExternalLink className="h-3 w-3" /></a>
    </div>
  );
}
