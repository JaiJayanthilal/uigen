// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

const { mockCookies } = vi.hoisted(() => ({ mockCookies: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

import { getSession } from "../auth";

// auth.ts falls back to this secret whenever JWT_SECRET isn't set in the environment.
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key"
);

function cookieStore(value?: string) {
  return {
    get: (name: string) =>
      name === "auth-token" && value !== undefined ? { value } : undefined,
  };
}

async function signToken(
  payload: Record<string, unknown>,
  expiration: string = "7d",
  secret: Uint8Array = JWT_SECRET
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiration)
    .setIssuedAt()
    .sign(secret);
}

beforeEach(() => {
  mockCookies.mockReset();
});

test("getSession returns null when there is no auth-token cookie", async () => {
  mockCookies.mockResolvedValue(cookieStore());

  expect(await getSession()).toBeNull();
});

test("getSession returns the decoded payload for a valid token", async () => {
  const token = await signToken({
    userId: "user-1",
    email: "user@example.com",
  });
  mockCookies.mockResolvedValue(cookieStore(token));

  const session = await getSession();

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("user@example.com");
});

test("getSession returns null for a malformed token", async () => {
  mockCookies.mockResolvedValue(cookieStore("not-a-valid-jwt"));

  expect(await getSession()).toBeNull();
});

test("getSession returns null for a token signed with the wrong secret", async () => {
  const wrongSecret = new TextEncoder().encode("some-other-secret");
  const token = await signToken(
    { userId: "user-1", email: "user@example.com" },
    "7d",
    wrongSecret
  );
  mockCookies.mockResolvedValue(cookieStore(token));

  expect(await getSession()).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await signToken(
    { userId: "user-1", email: "user@example.com" },
    "-1s"
  );
  mockCookies.mockResolvedValue(cookieStore(token));

  expect(await getSession()).toBeNull();
});
