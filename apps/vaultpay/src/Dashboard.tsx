import React from "react";
import { useVaultApi } from "./api";

export const Dashboard = () => {
  // Accessing the accounts service
  const { accounts } = useVaultApi();

  // hook call: automatic key = ['accounts', 'list', undefined, undefined]
  const {
    data: accountList,
    isLoading,
    error,
  } = accounts().list({
    hookOptions: {
      staleTime: 60000,
    },
  });

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">VaultPay Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountList?.map((acc: any) => (
          <div
            key={acc.id}
            className="bg-white p-6 rounded-xl shadow-lg border border-slate-100"
          >
            <h3 className="text-sm font-medium text-slate-500 uppercase">
              {acc.type}
            </h3>
            <p className="text-2xl font-bold text-slate-900">
              ${acc.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
