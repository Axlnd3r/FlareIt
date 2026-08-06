"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits, isAddress } from "viem";
import {
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Coins,
  Receipt,
  TrendingDown,
} from "lucide-react";
import { CONTRACT_ADDRESSES, SEND_CONTRACT_ABI, ERC20_ABI, FXRP_DECIMALS, getTxExplorerUrl } from "@/lib/contracts";
import { fetchRate, formatIdr, type RateData } from "@/lib/api";

export function SendForm() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [rateData, setRateData] = useState<RateData | null>(null);

  // Load initial rate data
  useEffect(() => {
    fetchRate().then(setRateData).catch(() => {
      setRateData({
        xrpUsd: 1.076952,
        usdIdr: 15850,
        xrpIdr: 17069.69,
        ftsoTimestamp: Math.floor(Date.now() / 1000),
        cacheUpdatedAt: Math.floor(Date.now() / 1000),
        ftsoFeedFresh: true,
        sources: { xrpUsd: "ftso-v2-on-chain", usdIdr: "coingecko-off-chain", xrpIdr: "derived" },
      });
    });
  }, []);

  // Contract reads: FXRP Balance & Allowance
  const { data: fxrpBalanceRaw, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && CONTRACT_ADDRESSES.SEND_CONTRACT ? [address, CONTRACT_ADDRESSES.SEND_CONTRACT] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();

  const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Derived state
  const numAmount = parseFloat(amount) || 0;
  const parsedAmount = numAmount > 0 ? parseUnits(amount, FXRP_DECIMALS) : BigInt(0);
  const fxrpBalance = fxrpBalanceRaw ? Number(formatUnits(fxrpBalanceRaw as bigint, FXRP_DECIMALS)) : 0;
  const currentAllowance = allowanceRaw ? (allowanceRaw as bigint) : BigInt(0);

  const needsApproval = parsedAmount > BigInt(0) && currentAllowance < parsedAmount;
  const isRecipientValid = recipient ? isAddress(recipient) : false;
  const hasEnoughBalance = fxrpBalance >= numAmount;

  // Remittance savings calculation vs Western Union / Traditional Bank (approx 7% fee)
  const idrValue = numAmount * (rateData?.xrpIdr || 17069);
  const traditionalFeeIdr = idrValue * 0.07; // 7% fee & FX markup
  const flareItFeeIdr = idrValue * 0.001; // < 0.1% gas cost
  const idrSavings = Math.max(0, traditionalFeeIdr - flareItFeeIdr);

  // Refetch balances after successful transaction
  useEffect(() => {
    if (isTxSuccess) {
      refetchBalance();
      refetchAllowance();
    }
  }, [isTxSuccess]);

  const handleApprove = () => {
    if (!CONTRACT_ADDRESSES.SEND_CONTRACT || parsedAmount <= BigInt(0)) return;
    writeContract({
      address: CONTRACT_ADDRESSES.FXRP,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.SEND_CONTRACT, parsedAmount],
    });
  };

  const handleSend = () => {
    if (!isRecipientValid || parsedAmount <= BigInt(0)) return;
    writeContract({
      address: CONTRACT_ADDRESSES.SEND_CONTRACT,
      abi: SEND_CONTRACT_ABI,
      functionName: "send",
      args: [recipient as `0x${string}`, parsedAmount],
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background Lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-flare-crimson/15 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-flare-bright" />
            Kirim FXRP Instan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengiriman uang tanpa perantara kustodian — sampai dalam hitungan detik
          </p>
        </div>

        {isConnected && (
          <div className="text-right bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Saldo FXRP Anda:</span>
            <span className="text-sm font-mono font-bold text-flare-bright">
              {fxrpBalance.toFixed(4)} FXRP
            </span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-flare-crimson/10 text-flare-bright flex items-center justify-center mx-auto mb-4 border border-flare-crimson/20">
            <Coins className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Sambungkan Wallet Anda</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Hubungkan wallet EVM (MetaMask/Injected) di jaringan Flare Coston2 untuk mengirim FXRP ke keluarga di Indonesia.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recipient Address Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Alamat Wallet Penerima (Indonesia)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0x... (Alamat EVM Penerima)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition ${
                  recipient && !isRecipientValid
                    ? "border-red-500/60 focus:border-red-500"
                    : isRecipientValid
                    ? "border-emerald-500/60 focus:border-emerald-500"
                    : "border-slate-800 focus:border-flare-bright"
                }`}
              />
              {isRecipientValid && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3.5 top-3.5" />
              )}
            </div>
            {recipient && !isRecipientValid && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Alamat EVM tidak valid. Harus diawali 0x dan 40 karakter hex.
              </p>
            )}
          </div>

          {/* FXRP Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Jumlah FXRP Yang Dikirim
              </label>
              <button
                type="button"
                onClick={() => setAmount(fxrpBalance.toString())}
                className="text-[11px] font-semibold text-flare-bright hover:underline"
              >
                Gunakan Semua ({fxrpBalance.toFixed(2)})
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-lg font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-flare-bright transition pr-20"
              />
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-flare-crimson/20 text-flare-bright font-extrabold text-xs border border-flare-crimson/40">
                <span>FXRP</span>
              </div>
            </div>

            {numAmount > 0 && !hasEnoughBalance && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Saldo FXRP tidak mencukupi (Tersedia: {fxrpBalance.toFixed(4)} FXRP)
              </p>
            )}
          </div>

          {/* Live Conversion & Remittance Savings Card */}
          {numAmount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-surface border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Estimasi IDR Diterima:</span>
                <span className="text-lg font-extrabold font-mono text-emerald-400">
                  ≈ {formatIdr(idrValue)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Penghematan vs Western Union:</span>
                </div>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  Hemat {formatIdr(idrSavings)} (7%)
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Approve vs Send */}
          <div className="pt-2">
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isWritePending || isTxWaiting || !hasEnoughBalance}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-extrabold text-base shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isWritePending || isTxWaiting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyetujui Alokasi FXRP...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Setujui FXRP (Step 1 dari 2)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!isRecipientValid || numAmount <= 0 || !hasEnoughBalance || isWritePending || isTxWaiting}
                className="w-full py-4 rounded-2xl bg-gradient-flare hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-base shadow-flare-glow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              >
                {isWritePending || isTxWaiting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memproses Transaksi di Coston2...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Kirim FXRP Sekarang</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Status Notifications */}
          {txHash && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Transaksi:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  {isTxSuccess ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Berhasil Dikirim!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Konfirmasi Block...
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tx Hash:</span>
                <a
                  href={getTxExplorerUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-flare-bright hover:underline flex items-center gap-1"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {writeError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Gagal memproses transaksi: {writeError.message.slice(0, 100)}...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
