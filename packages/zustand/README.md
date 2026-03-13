<p align="center">
  <img src="../../public/logo.png" width="200" alt="simple-api logo">
</p>

# @simple-api/zustand

**Seamless API-to-Store synchronization for simple-api.**

@simple-api/zustand provides a specialized middleware that pipes API responses directly into your Zustand stores. It eliminates the boilerplate of manually fetching data and explicitly calling store update functions.

---

## Key Features

- **Auto-Dispatch**: API responses are automatically injected into your store upon completion.
- **Key Mapping**: Map specific API calls to designated store keys for granular management.
- **Type Safety**: Full TypeScript support ensures injected data matches your store state.
- **Reactive Updates**: UI components react instantly to API returns without extra code.

---

## Installation

```bash
npm install @simple-api/zustand @simple-api/core zustand
```

---

## Quick Start

### 1. Define your Store

```typescript
import { create } from "zustand";

export const useUserStore = create((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
```

### 2. Configure the Middleware

```typescript
import { createApi } from "@simple-api/core";
import { createZustandMiddleware } from "@simple-api/zustand";
import { useUserStore } from "./store";

const api = createApi({
  baseUrl: "https://api.example.com",
  middleware: [
    createZustandMiddleware({
      stores: {
        userProfile: (data) => useUserStore.getState().setProfile(data),
      },
    }),
  ],
  services: {
    users: {
      get: { method: "GET", path: "/me" },
    },
  },
});
```

### 3. Trigger & Sync

```typescript
// The 'userProfile' store key is updated automatically on success
await api.users.get({
  storeKey: "userProfile",
});
```

---

## License

MIT © Elnatan Samuel
