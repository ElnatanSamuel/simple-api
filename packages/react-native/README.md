# @simple-api/react-native

**The mobile-optimized adapter for simple-api.**

@simple-api/react-native is a specialized wrapper around @simple-api/react, specifically tuned for the mobile environment. It ensures that your API engine performs optimally on iOS and Android devices, focusing on battery efficiency and shared logic.

## Key Features

- **Battery Efficient**: Leverages the core engine's request deduplication to minimize radio usage and preserve battery life.
- **Mobile Optimized**: Pre-configured defaults for React Native fetch patterns and environmental constraints.
- **Shared Architecture**: Use the exact same API definitions for both your web and mobile applications.
- **Zero Overhead**: Adds almost no weight over raw fetch, keeping your app bundle lean.

## Installation

```bash
npm install @simple-api/react-native @simple-api/core @tanstack/react-query
```

## Quick Start

### 1. Unified API Definition

One of the greatest strengths of simple-api is sharing your API definition between Web and Mobile:

```typescript
// shared/api.ts
import { createApi } from "@simple-api/core";

export const apiDefinition = createApi({
  baseUrl: "https://api.myapp.com",
  services: {
    auth: {
      login: { method: "POST", path: "/auth/login" },
    },
    content: {
      list: { method: "GET", path: "/items" },
    },
  },
});
```

### 2. Mobile-Specific Adapter

```tsx
// hooks/useApi.ts (Mobile Project)
import { createReactAdapter } from "@simple-api/react-native";
import { apiDefinition } from "../shared/api";

export const useMobileApi = createReactAdapter(apiDefinition);
```

### 3. Usage in Screens

```tsx
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useMobileApi } from "../hooks/useApi";

export const FeedScreen = () => {
  const { content } = useMobileApi();
  const { data, isLoading, error } = content().list();

  if (isLoading) return <ActivityIndicator color="#0000ff" />;
  if (error) return <Text>Error loading items</Text>;

  return (
    <View>
      {data.map((item) => (
        <Text key={item.id}>{item.title}</Text>
      ))}
    </View>
  );
};
```

## Mobile Best Practices

### Network Reliability

Mobile networks are often flaky. We recommend using the `createRetryMiddleware` in your core definition:

```typescript
import { createRetryMiddleware } from "@simple-api/core";

// In your shared api definition:
middleware: [createRetryMiddleware({ maxRetries: 3 })];
```

### Response Caching

Use `hookOptions` in your screens to control how long data stays in memory:

```typescript
content().list({
  hookOptions: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // Keep in memory for 1 hour
  },
});
```

### Request Cancellation

When a user navigates away from a screen, this adapter (powered by TanStack Query) automatically cancels pending network requests using AbortController, ensuring your app stays responsive and battery-efficient.

## License

MIT © Elnatan Samuel
