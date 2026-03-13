<p align="center">
  <img src="../../public/logo.png" width="200" alt="simple-api logo">
</p>

# @simple-api/react

**Production-grade TanStack Query adapter for simple-api.**

@simple-api/react provides a seamless bridge between your API definitions and React components. It automatically generates type-safe hooks for every endpoint, with built-in support for mutations, wildcard query invalidation, and global synchronization.

---

## Key Features

- **Auto-generated Hooks**: Every endpoint becomes a hook (e.g., `api.users().get()`).
- **Wildcard Invalidation**: Nuke entire service caches with `invalidates: ['users/*']`.
- **Deep Type Safety**: Full inference from your core API definition down to the component props.
- **TanStack v5 Support**: Native support for the latest query features (`isPending`, `isError`, etc.).
- **Deduplication Integration**: Seamlessly works with the core engine's request deduplication.

---

## Installation

```bash
npm install @simple-api/react @simple-api/core @tanstack/react-query
```

---

## Quick Start

### 1. Create the Adapter

```typescript
import { createApi } from "@simple-api/core";
import { createReactAdapter } from "@simple-api/react";

const api = createApi({
  baseUrl: "https://api.example.com",
  services: {
    users: {
      get: { method: "GET", path: "/users/:id" },
      update: { method: "PATCH", path: "/users/:id" },
    },
  },
});

export const useApi = createReactAdapter(api);
```

### 2. Fetching Data

```tsx
export const UserProfile = ({ id }) => {
  const { users } = useApi();
  const { data, isLoading } = users().get({ params: { id } });

  if (isLoading) return <div>Loading...</div>;
  return <h1>{data.name}</h1>;
};
```

---

## Advanced Invalidation

### Wildcard Patterns

The adapter supports wildcard invalidation strings to clear complex cache segments easily.

```tsx
const { execute } = users().update({
  params: { id: "123" },
  invalidates: ["users/*"], // Invalidates every query in the 'users' service
});
```

---

## Hook Options

Standard TanStack Query options can be passed via `hookOptions`.

```typescript
users().get({
  params: { id },
  hookOptions: {
    staleTime: 600000,
    gcTime: 3600000,
    enabled: !!id,
  },
});
```

---

## License

MIT © Elnatan Samuel
