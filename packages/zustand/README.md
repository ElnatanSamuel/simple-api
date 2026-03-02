# @simple-api/zustand 🐻

**Seamless API-to-Store synchronization for simple-api.**

`@simple-api/zustand` provides a specialized middleware that pipes API responses directly into your Zustand stores. It eliminates the boilerplate of manually fetching data and updating store states.

## ✨ Key Features

- **🔄 Auto-Dispatch**: API responses are automatically injected into your store.
- **🎯 Key Mapping**: Map specific API endpoints to specific store keys.
- **🛡️ Type Safety**: Guaranteed types for partial state updates.
- **⚡ Reactive**: Your UI updates instantly as the API returns data.

## 📦 Installation

```bash
npm install @simple-api/zustand @simple-api/core zustand
```

## 🚀 Quick Start

### 1. Define your Store

```typescript
import { create } from "zustand";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
}));
```

### 2. Configure the Middleware

```typescript
import { createApi } from "@simple-api/core";
import { createZustandMiddleware } from "@simple-api/zustand";
import { useAuthStore } from "./store";

const api = createApi({
  baseUrl: "...",
  middleware: [
    createZustandMiddleware({
      stores: {
        // Map the "auth" key to our store's update function
        auth: (data) => useAuthStore.getState().setUser(data),
      },
    }),
  ],
  services: {
    auth: {
      login: { method: "POST", path: "/login" },
    },
  },
});
```

### 3. Trigger & Sync

```typescript
// When this call completes, the auth store is updated automatically!
await api.auth.login({
  body: { email, password },
  storeKey: "auth", // This key matches the middleware config
});
```

## 🛠 Usage Patterns

### Optimistic UI (Manual)

The middleware triggers _after_ the request succeeds. For optimistic UI, we recommend updating the store manually before the call and using the middleware for the final source of truth.

### Global Loading States

You can use the middleware to toggle global loading flags in your store:

```typescript
createZustandMiddleware({
  stores: {
    loading: (isLoading) => useGlobalStore.getState().setLoading(isLoading),
  },
});
```

## 🧠 Why use this?

State management often involves a lot of "Fetch -> Await -> Store.Update" boilerplate. This middleware abstracts that into a single `storeKey` property in your request options, making your business logic much cleaner.

## 📄 License

MIT © Elnatan Samuel
