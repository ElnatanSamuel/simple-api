# @simple-api/react

**Production-grade TanStack Query adapter for simple-api.**

@simple-api/react provides a seamless bridge between your API definitions and React components. It automatically generates type-safe hooks for every endpoint, with built-in support for mutations, intelligent query invalidation, and global synchronization.

## Key Features

- **Auto-generated Hooks**: Every endpoint becomes a hook (e.g., `api.users().get()`).
- **Smart Invalidation**: Pass `invalidates: ['users']` to a mutation to automatically refresh related data across the entire application.
- **Deep Type Safety**: Full inference from your core API definition down to the component props.
- **TanStack v5 Support**: Leverages the latest query patterns, including `isPending`, `isError`, and the improved `useMutation` API.

## Installation

```bash
npm install @simple-api/react @simple-api/core @tanstack/react-query
```

## Quick Start

### 1. Create the Adapter

```typescript
// api.ts
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

### 2. Fetching Data (Queries)

The React adapter creates a structured hook system that mirrors your API definition.

```tsx
export const UserProfile = ({ id }) => {
  const { users } = useApi();

  // The queryKey is automatically managed: ['users', 'get', { id }]
  const { data, isLoading, error } = users().get({ params: { id } });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <h1>{data.name}</h1>;
};
```

### 3. Updating Data (Mutations)

The adapter simplifies mutations by handling the `execute` function and query invalidation automatically.

```tsx
export const UpdateProfile = () => {
  const { users } = useApi();

  const { execute, isPending } = users().update({
    params: { id: "123" },
    invalidates: ["users"], // Automatically refreshes the user list!
  });

  return (
    <button disabled={isPending} onClick={() => execute({ name: "New Name" })}>
      {isPending ? "Saving..." : "Save Changes"}
    </button>
  );
};
```

## Advanced Concepts

### Invalidation Strategies

The `invalidates` property is powerful. You can invalidate by service name or by specific query keys.

- `invalidates: ["users"]`: Invalidates every query within the `users` service.
- `invalidates: ["users.list"]`: Refines invalidation to a specific endpoint.

### Handling ApiError

Since the adapter is built on `@simple-api/core`, hooks will throw structured `ApiError` instances.

```tsx
const { error } = users().get({ params: { id } });

if (error instanceof ApiError) {
  console.log(error.status); // e.g., 401
  console.log(error.data); // Server-side error payload
}
```

### Hook Options

You can pass standard TanStack Query options directly to the hooks via the `hookOptions` property:

```typescript
users().get({
  params: { id },
  hookOptions: {
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!id,
  },
});
```

## Why use this adapter?

1. **Eliminate String Keys**: Never type a `queryKey` manually again.
2. **Centralized Logic**: Your API structure is the single source of truth.
3. **Consistency**: Forces a clean, service-oriented pattern across your entire frontend team.
4. **Resilience**: Inherits all global and service-level middlewares from your core engine.

## License

MIT © Elnatan Samuel
