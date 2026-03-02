# @simple-api/svelte

**Production-grade TanStack Query adapter for simple-api, optimized for Svelte.**

@simple-api/svelte brings the power of type-safe API definitions to the Svelte ecosystem. It leverages Svelte's native reactive stores and TanStack Query v5 to provide a high-performance, type-safe data fetching layer for your applications.

## Key Features

- **Svelte-Native Reactivity**: Uses Svelte's $ store syntax for accessing data, loading, and error states.
- **Auto-generated Functions**: Every endpoint becomes a reactive hook (e.g., `api.users().get()`).
- **Extreme Type Safety**: End-to-end TypeScript inference ensures your component data scales with your API.
- **TanStack v5 Support**: Utilizes the latest async patterns, including improved mutation management and query observation.

## Installation

```bash
npm install @simple-api/svelte @simple-api/core @tanstack/svelte-query
```

## Quick Start

### 1. Create the Adapter

```typescript
// api.js
import { createApi } from "@simple-api/core";
import { createSvelteAdapter } from "@simple-api/svelte";

const api = createApi({
  baseUrl: "https://api.example.com",
  services: {
    users: {
      get: { method: "GET", path: "/users/:id" },
      update: { method: "PATCH", path: "/users/:id" },
    },
  },
});

export const useApi = createSvelteAdapter(api);
```

### 2. Fetching Data (Queries)

The adapter returns Svelte stores that you can subscribe to using the `$` prefix.

```svelte
<script>
  import { useApi } from './api';
  const { users } = useApi();

  // 'user' is a reactive Svelte store
  const user = users().get({ params: { id: '1' } });
</script>

{#if $user.isLoading}
  <p>Loading...</p>
{:else if $error}
  <p>Error: {$error.message}</p>
{:else}
  <h1>{$user.data.name}</h1>
{/if}
```

### 3. Updating Data (Mutations)

Mutations are also reactive and provide an `execute` function.

```svelte
<script>
  import { useApi } from './api';
  const { users } = useApi();

  const mutation = users().update({
    params: { id: '1' },
    invalidates: ['users']
  });

  function handleSave() {
    $mutation.execute({ name: 'New Name' });
  }
</script>

<button
  on:click={handleSave}
  disabled={$mutation.isPending}
>
  {$mutation.isPending ? 'Saving...' : 'Save Changes'}
</button>
```

## Advanced Usage

### Hook Configuration

Pass standard TanStack Query options directly to refine behavior:

```typescript
users().get({
  params: { id },
  hookOptions: {
    staleTime: 60000,
    enabled: !!id,
  },
});
```

### Shared Logic

Because the adapter is built on `@simple-api/core`, all your global middlewares (logging, retries, transformers) work identically in Svelte as they do in our other framework adapters.

## Why use `@simple-api/svelte`?

Svelte's store model is inherently synchronous and reactive. This adapter bridges that gap with the asynchronous world of networking, providing a clean API that feels native to Svelte while maintaining the rigor of a full query engine.

## License

MIT © Elnatan Samuel
