# simple-api Engine

**The ultimate framework-agnostic API engine for high-scale TypeScript applications.**

simple-api is a production-grade, type-safe API client builder. It abstracts away the boilerplate of fetch, providing a service-oriented architecture with built-in resilience, performance, and multi-framework support.

---

## Packages

| Package                                            | Status | Description                                 |
| :------------------------------------------------- | :----- | :------------------------------------------ |
| [@simple-api/core](/packages/core)                 | Ready  | Pure TS Engine + Deduplication + Middleware |
| [@simple-api/react](/packages/react)               | Ready  | TanStack Query Adapter for React            |
| [@simple-api/svelte](/packages/svelte)             | Ready  | TanStack Query Adapter for Svelte           |
| [@simple-api/zustand](/packages/zustand)           | Ready  | Zustand Synchronization Middleware          |
| [@simple-api/react-native](/packages/react-native) | Ready  | Mobile-optimized Adapter                    |

---

## Core Features

### Framework Agnostic

The core engine runs anywhere—Node.js, Browser, React Native, or even a CLI. It has zero dependencies and a minimal footprint.

### Service-Based Architecture

Organize 100+ endpoints into logical services (e.g., api.users, api.auth). This prevents spaghetti code and provides a structured way to manage large API surfaces.

### Automatic DX

- **Path Parameters**: /users/:id is automatically resolved using params: { id: 123 }.
- **Query Serialization**: Complex objects provided in the query property are automatically converted to URL-safe search parameters.
- **Deep Typing**: Full TypeScript inference from definition to execution. No manual type casting required.

### Built-in Resilience and Performance

- **Tiered Middleware**: Apply logic at Global, Service, or Endpoint levels.
- **Request Deduplication**: Concurrent identical GET requests are merged into a single network call.
- **Auto-Retry**: Configurable exponential backoff for handling flaky network conditions.
- **Transformers**: Automatic case conversion (e.g., snake_case from server to camelCase in JS).
- **Structured Errors**: The ApiError class provides status codes and full response bodies for failed requests.

---

## Quick Start

### 1. Define your API

```typescript
import {
  createApi,
  createTransformerMiddleware,
  createRetryMiddleware,
  createLoggerMiddleware,
} from "@simple-api/core";

export const api = createApi({
  baseUrl: "https://api.example.com",
  middleware: [
    createLoggerMiddleware(),
    createTransformerMiddleware(),
    createRetryMiddleware({ maxRetries: 3 }),
  ],
  services: {
    auth: {
      middleware: [
        /* Auth-specific middleware */
      ],
      endpoints: {
        login: { method: "POST", path: "/auth/login" },
      },
    },
    users: {
      get: { method: "GET", path: "/users/:id" },
      list: { method: "GET", path: "/users" },
    },
  },
});
```

### 2. Connect to React

```tsx
import { createReactAdapter } from "@simple-api/react";

const useApi = createReactAdapter(api);

export const Profile = ({ id }) => {
  const { users } = useApi();
  const { data, isLoading } = users().get({ params: { id } });

  if (isLoading) return <p>Loading...</p>;
  return <h1>{data.userName}</h1>;
};
```

### 3. Sync with Zustand

```typescript
import { createZustandMiddleware } from "@simple-api/zustand";

// In your createApi config:
// createZustandMiddleware({
//   stores: {
//     user: (data) => useUserStore.getState().setUser(data),
//   },
// })

await api.users.get({
  params: { id: "123" },
  storeKey: "user",
});
```

---

## Advanced Functionality

### Tiered Middleware Execution

Middleware executes in a strict hierarchy:

1. **Global**: Applied to every single request in the engine.
2. **Service**: Applied only to endpoints within a specific service.
3. **Endpoint**: Applied only to a specific endpoint.

### Request Deduplication (GET)

The engine maintains a map of in-flight GET requests. If multiple parts of your application request the same data simultaneously, only one network request is made. The promise is shared across all callers.

### Structured Error Handling

Instead of generic errors, simple-api throws an ApiError:

```typescript
try {
  await api.users.get({ params: { id: "invalid" } });
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // 404
    console.log(error.data); // { message: "User not found" }
  }
}
```

---

## Development and Mocking

Develop your frontend in isolation using the Mock Middleware:

```typescript
const mockMiddleware = createMockMiddleware([
  {
    path: "/users/1",
    response: { id: 1, name: "John Doe" },
    delay: 500,
  },
]);
```

---

## License

MIT © Elnatan Samuel
