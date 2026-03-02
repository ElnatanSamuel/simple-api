# @simple-api/react ⚛️

**Production-grade TanStack Query adapter for simple-api.**

`@simple-api/react` provides a seamless bridge between your API definitions and React components. It automatically generates type-safe hooks for every endpoint, with built-in support for mutations, query invalidation, and global loading states.

## ✨ Key Features

- **🎣 Auto-generated Hooks**: Every endpoint becomes a hook (e.g., `api.users().get()`).
- **🔄 Smart Invalidation**: Pass `invalidates: ['users']` to a mutation to automatically refresh related data.
- **💎 Extreme Type Safety**: Full inference from your core API definition down to the component.
- **⚡ TanStack v5 Support**: Uses the latest query patterns, including `isPending` and `isError`.

## 📦 Installation

```bash
npm install @simple-api/react @simple-api/core @tanstack/react-query
```

## 🚀 Quick Start

### 1. Create the Adapter

```typescript
// api.ts
import { createApi } from "@simple-api/core";
import { createReactAdapter } from "@simple-api/react";

const api = createApi({ ... });
export const useApi = createReactAdapter(api);
```

### 2. Use in Components

#### Fetching Data (Queries)

```tsx
export const UserProfile = ({ id }) => {
  const { users } = useApi();

  // queryKey is automatically managed: ['users', 'get', { id }]
  const { data, isLoading, error } = users().get({ params: { id } });

  if (isLoading) return <div>Loading...</div>;
  return <h1>{data.name}</h1>;
};
```

#### Updating Data (Mutations)

```tsx
export const UpdateProfile = () => {
  const { users } = useApi();

  const { execute, isLoading } = users().update({
    params: { id: "123" },
    invalidates: ["users"], // Automatically refreshes the user list!
  });

  return (
    <button onClick={() => execute({ name: "New Name" })}>
      {isLoading ? "Saving..." : "Save"}
    </button>
  );
};
```

## 🛠 Advanced Usage

### Custom Hook Options

You can pass standard TanStack Query options directly via `hookOptions`:

```typescript
users().list({
  hookOptions: {
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
});
```

### Complex Invalidation

Invalidate multiple query keys at once:

```typescript
users().create({
  invalidates: ["users", "dashboard-stats"],
});
```

## 🧠 Why use this over raw `useQuery`?

1. **Centralized Definition**: Your API structure lives in one place, not scattered across components.
2. **Key Management**: No more manually managing `['users', id]` strings.
3. **Consistency**: All developers follow the exact same pattern for every API call.
4. **Resilience**: Inherits all middlewares (retires, logging, etc.) defined in your core engine.

## 📄 License

MIT © Elnatan Samuel
