# @simple-api/zustand

**Seamless API-to-Store synchronization for simple-api.**

@simple-api/zustand provides a specialized middleware that pipes API responses directly into your Zustand stores. It eliminates the boilerplate of manually fetching data and explicitly calling store update functions.

## Key Features

- **Auto-Dispatch**: API responses are automatically injected into your store upon successful request completion.
- **Key Mapping**: Map specific API calls to designated store keys for granular state management.
- **Type Safety**: Full TypeScript support ensures that the data being injected matches your store state.
- **Reactive Updates**: Your UI components react instantly to API returns without extra code.

## Installation

```bash
npm install @simple-api/zustand @simple-api/core zustand
```

## Quick Start

### 1. Define your Store

```typescript
import { create } from "zustand";

interface UserState {
  profile: any;
  setProfile: (profile: any) => void;
}

export const useUserStore = create<UserState>((set) => ({
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
        // Map the "userProfile" key to our store's update function
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
// When this call succeeds, the Zustand store is updated automatically.
// The engine handles the 'await' and 'dispatch' logic for you.
await api.users.get({
  storeKey: "userProfile", // This key must match the middleware config
});
```

## Usage Patterns

### Selective Synchronization

You don't have to sync every request. Only provide a `storeKey` when you want the response data to be persisted in your state management layer.

### Loading States

You can use the middleware to toggle global loading flags:

```typescript
createZustandMiddleware({
  stores: {
    globalLoader: (isLoading) => useUIStore.getState().setLoading(isLoading),
  },
});
```

### Error Handling

The middleware only triggers on successful requests. If the API returns an error, the store remains untouched, and you can handle the error via a `try/catch` block or the `ApiError` class.

## Why use this middleware?

In modern applications, state management can become a heavy layer of "Fetch -> Await -> Dispatch" boilerplate. This middleware abstracts that cycle, allowing your API engine to communicate directly with your stores based on simple configuration keys.

## License

MIT © Elnatan Samuel
