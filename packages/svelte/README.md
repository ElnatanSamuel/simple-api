<p align="center">
  <img src="../../public/logo.png" width="200" alt="simple-api logo">
</p>

# @simple-api/svelte

**Production-grade TanStack Query adapter for simple-api, optimized for Svelte.**

@simple-api/svelte brings the power of type-safe API definitions to the Svelte ecosystem. It leverages Svelte's native reactive stores and TanStack Query v5 to provide a high-performance, type-safe data fetching layer.

---

## Key Features

- **Svelte-Native Reactivity**: Uses Svelte's `$` store syntax for seamless data access.
- **Auto-generated Functions**: Every endpoint becomes a reactive hook (e.g., `api.users().get()`).
- **Deep Type Safety**: End-to-end TypeScript inference ensures component data scales with your API.
- **TanStack v5 Support**: Native support for the latest async patterns and mutation management.

---

## Installation

```bash
npm install @simple-api/svelte @simple-api/core @tanstack/svelte-query
```

---

## Quick Start

### 1. Create the Adapter

```typescript
import { createApi } from "@simple-api/core";
import { createSvelteAdapter } from "@simple-api/svelte";

const api = createApi({
  baseUrl: "https://api.example.com",
  services: {
    users: {
      get: { method: "GET", path: "/users/:id" },
    },
  },
});

export const useApi = createSvelteAdapter(api);
```

### 2. Fetching Data

```svelte
<script>
  import { useApi } from './api';
  const { users } = useApi();

  const user = users().get({ params: { id: '1' } });
</script>

{#if $user.isLoading}
  <p>Loading...</p>
{:else if $user.isError}
  <p>Error: {$user.error.message}</p>
{:else}
  <h1>{$user.data.name}</h1>
{/if}
```

---

## Advanced Options

Standard TanStack Query options can be passed via `hookOptions`.

```typescript
users().get({
  params: { id },
  hookOptions: {
    staleTime: 60000,
    enabled: !!id,
  },
});
```

---

## License

MIT © Elnatan Samuel
