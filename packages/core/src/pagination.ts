/**
 * Framework-agnostic pagination helper.
 * Works with any simple-api engine endpoint — React, Svelte, React Native, plain TS.
 *
 * Usage:
 *   const pager = createPagination(api.users.list, { pageSize: 20 });
 *   const page1 = await pager.fetchPage(1);
 *   const page2 = await pager.fetchPage(2);
 *   const next  = await pager.nextPage();
 */

export interface PaginationConfig {
  /** Number of items per page. Default: 20 */
  pageSize?: number;
  /** Query param name for page number. Default: "page" */
  pageParam?: string;
  /** Query param name for page size. Default: "limit" */
  limitParam?: string;
  /** Query param name for cursor (cursor-based pagination). */
  cursorParam?: string;
}

export interface PaginationState<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  cursor?: string;
}

export interface PaginationHelper<T> {
  fetchPage: (
    page: number,
    extraQuery?: Record<string, any>,
  ) => Promise<PaginationState<T>>;
  nextPage: (extraQuery?: Record<string, any>) => Promise<PaginationState<T>>;
  prevPage: (extraQuery?: Record<string, any>) => Promise<PaginationState<T>>;
  fetchCursor: (
    cursor?: string,
    extraQuery?: Record<string, any>,
  ) => Promise<PaginationState<T>>;
  reset: () => void;
  getState: () => PaginationState<T>;
}

/**
 * Creates a stateful pagination controller around any endpoint executor.
 *
 * @param executor - The endpoint function returned by createApi (e.g. api.users.list)
 * @param config   - Pagination options
 */
export function createPagination<T = any>(
  executor: (options?: any) => Promise<any>,
  config: PaginationConfig = {},
): PaginationHelper<T> {
  const pageParam = config.pageParam ?? "page";
  const limitParam = config.limitParam ?? "limit";
  const cursorParam = config.cursorParam ?? "cursor";
  const pageSize = config.pageSize ?? 20;

  let state: PaginationState<T> = {
    data: [],
    currentPage: 1,
    pageSize,
    hasNextPage: false,
    hasPrevPage: false,
    cursor: undefined,
  };

  /**
   * Normalizes a response into a standard shape.
   * Handles: { data: [], total: N }, { results: [], count: N }, and plain arrays.
   */
  function normalize(raw: any, page: number): PaginationState<T> {
    let items: T[];
    let hasNext = false;

    if (Array.isArray(raw)) {
      items = raw;
      hasNext = raw.length === pageSize;
    } else if (raw?.data) {
      items = raw.data;
      hasNext = raw.total
        ? page * pageSize < raw.total
        : raw.data.length === pageSize;
    } else if (raw?.results) {
      items = raw.results;
      hasNext = raw.count
        ? page * pageSize < raw.count
        : raw.results.length === pageSize;
    } else if (raw?.items) {
      items = raw.items;
      hasNext = raw.total
        ? page * pageSize < raw.total
        : raw.items.length === pageSize;
    } else {
      items = [];
    }

    return {
      data: items,
      currentPage: page,
      pageSize,
      hasNextPage: hasNext,
      hasPrevPage: page > 1,
      cursor: raw?.nextCursor ?? raw?.cursor ?? undefined,
    };
  }

  const helper: PaginationHelper<T> = {
    async fetchPage(page, extraQuery = {}) {
      const raw = await executor({
        query: { [pageParam]: page, [limitParam]: pageSize, ...extraQuery },
      });
      state = normalize(raw, page);
      return state;
    },

    async nextPage(extraQuery = {}) {
      if (!state.hasNextPage) return state;
      return helper.fetchPage(state.currentPage + 1, extraQuery);
    },

    async prevPage(extraQuery = {}) {
      if (!state.hasPrevPage) return state;
      return helper.fetchPage(state.currentPage - 1, extraQuery);
    },

    async fetchCursor(cursor, extraQuery = {}) {
      const raw = await executor({
        query: {
          ...(cursor ? { [cursorParam]: cursor } : {}),
          [limitParam]: pageSize,
          ...extraQuery,
        },
      });
      // Cursor pagination always starts at "page 1" conceptually
      state = normalize(raw, 1);
      state.hasPrevPage = !!cursor;
      return state;
    },

    reset() {
      state = {
        data: [],
        currentPage: 1,
        pageSize,
        hasNextPage: false,
        hasPrevPage: false,
        cursor: undefined,
      };
    },

    getState() {
      return { ...state };
    },
  };

  return helper;
}
