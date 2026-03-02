import React, { useState } from "react";
import { useVaultApi } from "./api";

export const SendMoney = () => {
  const { transactions } = useVaultApi();
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");

  // Mutation with invalidation strategy
  const {
    execute: send,
    isLoading,
    isSuccess,
  } = transactions().send({
    invalidates: ["accounts", "transactions"], // Automatically clears relevant caches
    hookOptions: {
      onSuccess: () => alert("Transfer successful!"),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ targetId, amount: Number(amount) });
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-6">Send Money</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Target Account ID
          </label>
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Transfer Funds"}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-4 text-green-600 text-center">Transfer complete!</p>
      )}
    </div>
  );
};
