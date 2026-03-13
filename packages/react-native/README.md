<p align="center">
  <img src="../../public/logo.png" width="200" alt="simple-api logo">
</p>

# @simple-api/react-native

**The mobile-optimized adapter for simple-api.**

@simple-api/react-native is a specialized wrapper around @simple-api/react, tuned for the mobile environment. It ensures that your API engine performs optimally on iOS and Android devices, focusing on battery efficiency, connectivity resilience, and shared logic.

---

## Key Features

- **Offline Queue**: mutation persistence and replay support for flaky networks.
- **Battery Efficient**: Leverages the core engine's request deduplication to minimize radio usage.
- **Mobile Optimized**: Defaults tuned for React Native fetch and environmental constraints.
- **Shared Architecture**: Use the exact same API definitions for both web and mobile.

---

## Installation

```bash
npm install @simple-api/react-native @simple-api/core @tanstack/react-query
```

---

## Quick Start

### 1. Define your API

```typescript
// shared/api.ts
import { createApi } from "@simple-api/core";

export const apiDefinition = createApi({
  baseUrl: "https://api.myapp.com",
  services: {
    posts: {
      list: { method: "GET", path: "/posts" },
      create: { method: "POST", path: "/posts" },
    },
  },
});
```

### 2. Mobile-Specific Adapter

```tsx
// hooks/useApi.ts
import { createReactAdapter } from "@simple-api/react-native";
import { apiDefinition } from "../shared/api";

export const useMobileApi = createReactAdapter(apiDefinition);
```

---

## Offline Queue

The React Native adapter includes a powerful `createOfflineQueue` utility for handling mutations when the device is disconnected.

```tsx
import { createOfflineQueue } from "@simple-api/react-native";

const queue = createOfflineQueue({
  onSuccess: (id, res) => console.log("Synced!", res),
  maxRetries: 5,
});

// Add anytime. If online, it fires. If offline, it waits.
queue.add(() => api.posts.create({ body: { text: "Offline post" } }));

// Replay manually or on network event
queue.flush();
```

---

## License

MIT © Elnatan Samuel
