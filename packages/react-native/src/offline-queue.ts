/**
 * Offline Queue for React Native.
 *
 * Queues mutations made while the device is offline and replays them
 * in order when connectivity is restored.
 *
 * Usage:
 *   import { createOfflineQueue } from "@simple-api/react-native";
 *
 *   const queue = createOfflineQueue();
 *
 *   // Register your online/offline listeners (NetInfo recommended)
 *   NetInfo.addEventListener(state => {
 *     if (state.isConnected) queue.flush();
 *     else queue.pause();
 *   });
 *
 *   // Enqueue a mutation
 *   queue.add(() => api.orders.create({ body: { item: "shoe" } }));
 */

export interface QueuedRequest {
  id: string;
  executor: () => Promise<any>;
  retries: number;
  maxRetries: number;
  addedAt: number;
}

export interface OfflineQueueOptions {
  /** Max times to retry a single queued request on failure. Default: 3 */
  maxRetries?: number;
  /** Callback fired when a queued request succeeds. */
  onSuccess?: (id: string, data: any) => void;
  /** Callback fired when a queued request fails permanently. */
  onFailure?: (id: string, error: Error) => void;
  /** Callback fired after every flush attempt. */
  onFlush?: (succeeded: number, failed: number) => void;
}

export interface OfflineQueue {
  /** Add a request executor to the queue. Returns the queued request ID. */
  add: (executor: () => Promise<any>, maxRetries?: number) => string;
  /** Flush all queued requests. Typically called when connectivity is restored. */
  flush: () => Promise<void>;
  /** Pause the queue. Queued items accumulate but do not execute. */
  pause: () => void;
  /** Resume and optionally flush immediately. */
  resume: (flushNow?: boolean) => void;
  /** Remove a specific request from the queue before it executes. */
  remove: (id: string) => void;
  /** Clear the entire queue. */
  clear: () => void;
  /** Returns a snapshot of current queued request IDs. */
  getQueue: () => string[];
  /** Whether the queue is currently paused. */
  isPaused: () => boolean;
}

let _idCounter = 0;

export function createOfflineQueue(
  options: OfflineQueueOptions = {},
): OfflineQueue {
  const maxRetries = options.maxRetries ?? 3;
  let queue: QueuedRequest[] = [];
  let paused = false;
  let flushing = false;

  const queue_obj: OfflineQueue = {
    add(executor, retries = maxRetries) {
      const id = `oq_${Date.now()}_${++_idCounter}`;
      queue.push({
        id,
        executor,
        retries,
        maxRetries: retries,
        addedAt: Date.now(),
      });
      return id;
    },

    async flush() {
      if (paused || flushing) return;
      flushing = true;

      let succeeded = 0;
      let failed = 0;
      const remaining: QueuedRequest[] = [];

      for (const item of queue) {
        try {
          const data = await item.executor();
          succeeded++;
          options.onSuccess?.(item.id, data);
        } catch (err: any) {
          if (item.retries > 0) {
            remaining.push({ ...item, retries: item.retries - 1 });
          } else {
            failed++;
            options.onFailure?.(item.id, err);
          }
        }
      }

      queue = remaining;
      flushing = false;
      options.onFlush?.(succeeded, failed);
    },

    pause() {
      paused = true;
    },

    resume(flushNow = true) {
      paused = false;
      if (flushNow) queue_obj.flush();
    },

    remove(id) {
      queue = queue.filter((item) => item.id !== id);
    },

    clear() {
      queue = [];
    },

    getQueue() {
      return queue.map((item) => item.id);
    },

    isPaused() {
      return paused;
    },
  };

  return queue_obj;
}
