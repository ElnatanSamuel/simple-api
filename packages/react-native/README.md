# @simple-api/react-native 📱

**The mobile-optimized adapter for simple-api.**

`@simple-api/react-native` is a thin wrapper around `@simple-api/react`, specially tuned for mobile development. It ensures your API engine performs optimally in the React Native environment, with planned support for NetInfo and offline storage.

## ✨ Key Features

- **🔋 Battery Efficient**: Inherits core engine's deduplication to minimize radio usage.
- **🔌 Mobile Ready**: Pre-configured for common React Native fetch patterns.
- **💎 Extreme Type Safety**: Shared definitions between your web and mobile apps.
- **⚡ Fast Response**: Minimal overhead over raw fetch.

## 📦 Installation

```bash
npm install @simple-api/react-native @simple-api/core @tanstack/react-query
```

## 🚀 Quick Start

### 1. Unified API Definition

One of the greatest strengths of `simple-api` is sharing your API definition between Web and Mobile:

```typescript
// shared-api.ts
import { createApi } from "@simple-api/core";

export const apiDefinition = createApi({
  baseUrl: "https://api.myapp.com",
  services: { ... }
});
```

### 2. Mobile-Specific Adapter

```tsx
// hooks.tsx (Mobile)
import { createReactAdapter } from "@simple-api/react-native";
import { apiDefinition } from "./shared-api";

export const useMobileApi = createReactAdapter(apiDefinition);
```

### 3. Usage in Screen Components

```tsx
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useMobileApi } from "./hooks";

export const UserScreen = ({ userId }) => {
  const { users } = useMobileApi();
  const { data, isLoading } = users().get({ params: { id: userId } });

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Name: {data.name}</Text>
    </View>
  );
};
```

## 🧠 Mobile Best Practices

### Network State

While the core engine handles retries, on mobile you should frequently use `hookOptions` to control behavior based on network connectivity:

```typescript
users().list({
  hookOptions: {
    retry: 2,
    staleTime: 0,
    gcTime: 1000 * 60 * 60, // Keep in memory for 1 hour
  },
});
```

### Request Cancellation

When a mobile user navigates away from a screen, TanStack Query (which powers this adapter) automatically handles request cancellation through AbortController, staying battery-efficient.

## 📄 License

MIT © Elnatan Samuel
