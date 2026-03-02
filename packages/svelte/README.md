# @simple-api/svelte 🧡

**Production-grade TanStack Query adapter for simple-api, optimized for Svelte.**

`@simple-api/svelte` brings the power of type-safe API definitions to the Svelte ecosystem. It leverages Svelte's reactive stores and TanStack Query v5 to provide a smooth, type-safe data fetching experience.

## ✨ Key Features

- **🎣 Svelte-Native Hooks**: Uses Svelte's reactive stores for data, loading, and error states.
- **🔄 Auto-generated Functions**: Every endpoint becomes a reactive hook (e.g., `api.users().get()`).
- **💎 Extreme Type Safety**: Full inference from your core API definition down to your `.svelte` components.
- **⚡ TanStack v5 Support**: Uses the latest reactive patterns, including `isPending` and `isError`.

## 📦 Installation

```bash
npm install @simple-api/svelte @simple-api/core @tanstack/svelte-query
```

## 🚀 Quick Start

### 1. Create the Adapter

```typescript
// api.js
import { createApi } from "@simple-api/core";
import { createSvelteAdapter } from "@simple-api/svelte";

const api = createApi({ ... });
export const useApi = createSvelteAdapter(api);
```

### 2. Use in Components

#### Fetching Data (Queries)

```svelte
<script>
  import { useApi } from './api';
  const { users } = useApi();

  // result is a reactive Svelte store
  const user = users().get({ params: { id: '1' } });
</script>

{#if $user.isLoading}
  <p>Loading...</p>
{:else if $user.error}
  <p>Error: {$user.error.message}</p>
{:else}
  <h1>{$user.data.name}</h1>
{/if}
```

#### Updating Data (Mutations)

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

<button on:click={handleSave} disabled={$mutation.isLoading}>
  {$mutation.isLoading ? 'Saving...' : 'Save'}
</button>
```

## 🛠 Advanced Usage

### Custom Store Options

You can pass standard TanStack Query options directly via `hookOptions`:

```typescript
users().list({
  hookOptions: {
    enabled: !!id,
    staleTime: 1000 * 60,
  },
});
```

## 🧠 Why Svelte?

Svelte's store-based reactivity is a perfect match for the asynchronous nature of API calls. `@simple-api/svelte` abstracts the complex store management, allowing you to focus on building features instead of managing network state.

## 📄 License

MIT © Elnatan Samuel
