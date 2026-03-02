import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApi } from "./index";

// Mock fetch
global.fetch = vi.fn();

describe("Service-Level Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("should execute middleware in order: Global -> Service -> Endpoint", async () => {
    const order: string[] = [];

    const globalMiddleware = async (ctx: any, next: any) => {
      order.push("global-before");
      const res = await next(ctx.options);
      order.push("global-after");
      return res;
    };

    const serviceMiddleware = async (ctx: any, next: any) => {
      order.push("service-before");
      const res = await next(ctx.options);
      order.push("service-after");
      return res;
    };

    const endpointMiddleware = async (ctx: any, next: any) => {
      order.push("endpoint-before");
      const res = await next(ctx.options);
      order.push("endpoint-after");
      return res;
    };

    const api = createApi({
      baseUrl: "https://api.test.com",
      middleware: [globalMiddleware],
      services: {
        testService: {
          middleware: [serviceMiddleware],
          endpoints: {
            testEndpoint: {
              method: "GET",
              path: "/test",
              middleware: [endpointMiddleware],
            },
          },
        },
      },
    });

    await api.testService.testEndpoint();

    expect(order).toEqual([
      "global-before",
      "service-before",
      "endpoint-before",
      "endpoint-after",
      "service-after",
      "global-after",
    ]);
  });

  it("should support direct endpoints record for services (backwards compatibility)", async () => {
    const api = createApi({
      baseUrl: "https://api.test.com",
      services: {
        legacyService: {
          get: { method: "GET", path: "/legacy" },
        },
      },
    });

    const res = await api.legacyService.get();
    expect(res).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/legacy"),
      expect.anything(),
  it("should throw ApiError with status and data on failed request", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({ message: "User not found" }),
    });

    const api = createApi({
      baseUrl: "https://api.test.com",
      services: {
        users: {
          get: { method: "GET", path: "/users/1" },
        },
      },
    });

    try {
      await api.users.get();
      expect.fail("Should have thrown ApiError");
    } catch (error: any) {
      expect(error.name).toBe("ApiError");
      expect(error.status).toBe(404);
      expect(error.data).toEqual({ message: "User not found" });
      expect(error.message).toBe("User not found");
    }
  });
});
