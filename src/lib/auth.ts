import type { AuthSession, PublicUser, User, UserRole } from "../types/petcare";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./validation";
import {
  createId,
  nowIso,
  PetCareRepository,
  toPublicUser,
} from "./repository";

export class AuthenticationError extends Error {
  public readonly statusCode = 401;

  public constructor(message = "Authentication is required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class RegistrationError extends Error {
  public readonly statusCode = 409;

  public constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}

export interface AuthResult {
  user: PublicUser;
  session: AuthSession;
}

export interface AuthServiceOptions {
  sessionDurationMs?: number;
  now?: () => Date;
  /**
   * Useful only for a controlled local demo. Production must keep this false
   * until veterinarian and provider credentials have been verified.
   */
  allowSelfServiceRoles?: boolean;
}

const PBKDF2_ITERATIONS = 120_000;

function bytesToHex(bytes: Uint8Array): string {
  let output = "";
  for (const byte of bytes) {
    output += byte.toString(16).padStart(2, "0");
  }
  return output;
}

function hexToBytes(value: string): Uint8Array | undefined {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return undefined;
  }

  const output = new Uint8Array(value.length / 2);
  for (let index = 0; index < output.length; index += 1) {
    output[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return output;
}

function weakHash(value: string): string {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function fallbackSalt(): string {
  const base = Date.now().toString(36) + Math.random().toString(36);
  return weakHash(base) + weakHash(base.split("").reverse().join(""));
}

function timingSafeEquals(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let result = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    result |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return result === 0;
}

async function pbkdf2Hash(password: string, salt: Uint8Array): Promise<string | undefined> {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    return undefined;
  }

  try {
    const encoder = new TextEncoder();
    // Web Crypto’s DOM typing expects an ArrayBuffer-backed view. Copying the
    // salt also avoids cross-runtime SharedArrayBuffer incompatibilities.
    const safeSalt = new Uint8Array(salt.byteLength);
    safeSalt.set(salt);
    const key = await cryptoApi.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await cryptoApi.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: safeSalt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      key,
      256,
    );
    return bytesToHex(new Uint8Array(bits));
  } catch {
    return undefined;
  }
}

/**
 * Uses Web Crypto PBKDF2 when it is available in the current runtime. The
 * fallback exists solely so local mock mode also works in constrained test
 * runtimes; it must not be used as a production credential store.
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const salt = new Uint8Array(16);
    cryptoApi.getRandomValues(salt);
    const digest = await pbkdf2Hash(password, salt);
    if (digest) {
      return "pbkdf2$" + PBKDF2_ITERATIONS + "$" + bytesToHex(salt) + "$" + digest;
    }
  }

  const salt = fallbackSalt();
  return "mock$" + salt + "$" + weakHash(salt + ":" + password);
}

export async function verifyPassword(
  password: string,
  encodedPassword: string,
): Promise<boolean> {
  const parts = encodedPassword.split("$");
  if (
    parts.length === 4 &&
    parts[0] === "pbkdf2" &&
    Number(parts[1]) === PBKDF2_ITERATIONS
  ) {
    const salt = hexToBytes(parts[2]);
    if (!salt) {
      return false;
    }
    const digest = await pbkdf2Hash(password, salt);
    return digest ? timingSafeEquals(digest, parts[3]) : false;
  }

  if (parts.length === 3 && parts[0] === "mock") {
    return timingSafeEquals(weakHash(parts[1] + ":" + password), parts[2]);
  }

  return false;
}

function sessionFor(userId: string, now: Date, durationMs: number): AuthSession {
  const createdAt = now.toISOString();
  return {
    id: createId("session"),
    token: createId("token"),
    userId,
    createdAt,
    expiresAt: new Date(now.getTime() + durationMs).toISOString(),
  };
}

function publicResult(user: User, session: AuthSession): AuthResult {
  return { user: toPublicUser(user), session };
}

export class AuthService {
  private readonly sessionDurationMs: number;
  private readonly clock: () => Date;
  private readonly allowSelfServiceRoles: boolean;

  public constructor(
    private readonly repository: PetCareRepository,
    options: AuthServiceOptions = {},
  ) {
    this.sessionDurationMs = options.sessionDurationMs ?? 1000 * 60 * 60 * 24 * 7;
    this.clock = options.now ?? (() => new Date());
    this.allowSelfServiceRoles = options.allowSelfServiceRoles ?? false;
  }

  public async register(input: RegisterInput): Promise<AuthResult> {
    const parsed = registerSchema.parse(input);
    const existing = this.repository.findUserByEmail(parsed.email);
    if (existing) {
      throw new RegistrationError("An account with this email already exists.");
    }

    const selectedRole: UserRole =
      this.allowSelfServiceRoles && parsed.role ? parsed.role : "PET_OWNER";
    const now = this.clock();
    const passwordHash = await hashPassword(parsed.password);
    const user: User = {
      id: createId("user"),
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      role: selectedRole,
      passwordHash,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const session = sessionFor(user.id, now, this.sessionDurationMs);

    return this.repository.transaction((draft) => {
      if (draft.users.some((candidate) => candidate.email === user.email)) {
        throw new RegistrationError("An account with this email already exists.");
      }
      draft.users.push(user);
      draft.sessions.push(session);
      return publicResult(user, session);
    });
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    const parsed = loginSchema.parse(input);
    const user = this.repository.findUserByEmail(parsed.email);
    if (!user || !user.isActive) {
      throw new AuthenticationError("Invalid email or password.");
    }

    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError("Invalid email or password.");
    }
    if (parsed.expectedRole && parsed.expectedRole !== user.role) {
      throw new AuthenticationError("This account is registered for a different workspace. Choose the matching account type and try again.");
    }

    const session = sessionFor(user.id, this.clock(), this.sessionDurationMs);
    return this.repository.transaction((draft) => {
      draft.sessions = draft.sessions.filter(
        (candidate) =>
          candidate.userId !== user.id ||
          new Date(candidate.expiresAt).getTime() > this.clock().getTime(),
      );
      draft.sessions.push(session);
      return publicResult(user, session);
    });
  }

  public getSession(token: string | undefined): AuthResult | undefined {
    if (!token) {
      return undefined;
    }

    const now = this.clock().getTime();
    const state = this.repository.snapshot();
    const session = state.sessions.find(
      (candidate) =>
        candidate.token === token &&
        new Date(candidate.expiresAt).getTime() > now,
    );
    if (!session) {
      return undefined;
    }

    const user = state.users.find(
      (candidate) => candidate.id === session.userId && candidate.isActive,
    );
    return user ? publicResult(user, session) : undefined;
  }

  public requireSession(token: string | undefined): AuthResult {
    const result = this.getSession(token);
    if (!result) {
      throw new AuthenticationError();
    }
    return result;
  }

  public logout(token: string | undefined): void {
    if (!token) {
      return;
    }

    this.repository.transaction((draft) => {
      draft.sessions = draft.sessions.filter((session) => session.token !== token);
    });
  }

  public purgeExpiredSessions(): number {
    const now = this.clock().getTime();
    return this.repository.transaction((draft) => {
      const initialCount = draft.sessions.length;
      draft.sessions = draft.sessions.filter(
        (session) => new Date(session.expiresAt).getTime() > now,
      );
      return initialCount - draft.sessions.length;
    });
  }
}

export function isActiveRole(
  user: Pick<User, "role" | "isActive">,
  role: UserRole,
): boolean {
  return user.isActive && user.role === role;
}

export { nowIso };
