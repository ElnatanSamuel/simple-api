import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApi } from "./index";
import { createTransformerMiddleware } from "./transformers";
import { createRetryMiddleware } from "./retry";

describe("Core API Engine - MVP Features", () => {
  const baseUrl = "https://api.test";

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: "success" }),
        }),
      ),
    );
  });

  describe("Request Deduplication", () => {
    it("should deduplicate parallel GET requests to the same URL", async () => {
      const api = createApi({
        baseUrl,
        services: {
          test: { get: { method: "GET", path: "/dedupe" } },
        },
      });

      // Fire 3 parallel requests
      const results = await Promise.all([
        api.test.get(),
        api.test.get(),
        api.test.get(),
      ]);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(results[0]).toEqual(results[1]);
    });

    it("should NOT deduplicate POST requests", async () => {
      const api = createApi({
        baseUrl,
        services: {
          test: { post: { method: "POST", path: "/no-dedupe" } },
        },
      });

      await Promise.all([api.test.post(), api.test.post()]);

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Transformer Middleware", () => {
    it("should convert request body to snake_case and response to camelCase", async () => {
      vi.mocked(fetch).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user_id: 1, user_name: "test" }),
        } as any),
      );

      const api = createApi({
        baseUrl,
        middleware: [createTransformerMiddleware()],
        services: {
          users: { create: { method: "POST", path: "/users" } },
        },
      });

      const response = await api.users.create({
        body: { userId: 1, userName: "test" },
      });

      const fetchArgs = vi.mocked(fetch).mock.calls[0][1];
      expect(fetchArgs?.body).toContain('"user_id":1');
      expect(response.userId).toBe(1);
      expect(response.userName).toBe("test");
    });
  });

  describe("Retry Middleware", () => {
    it("should retry failed requests", async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as any);

      const api = createApi({
        baseUrl,
        middleware: [createRetryMiddleware({ maxRetries: 1, initialDelay: 0 })],
        services: {
          test: { run: { method: "GET", path: "/retry" } },
        },
      });

      const res = await api.test.run();
      expect(res.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
