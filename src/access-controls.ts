import { verify, Signature } from '@noble/secp256k1';

/**
 * Decoded access controls payload from the Frontier API.
 * Signed with ECDSA secp256k1 + SHA-256 by the API server.
 */
export interface AccessControlsPayload {
  smartAccountAddress: string | null;
  email: string;
  isSuperuser: boolean;
  /** e.g. 'active', 'canceled', 'awaiting_approval', or null if no subscription */
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  subscriptionInterval: string | null;
  /** e.g. 'crypto', 'stripe', 'grant', 'office', 'internship', or null if no subscription */
  subscriptionType: string | null;
  addOns: string[];
  communities: string[];
  managedCommunities: string[];
  timestamp: string;
  kid: string;
}

/**
 * Raw signed access controls envelope as returned by the API
 * and relayed through the PWA host.
 */
export interface SignedAccessControls {
  /** Base64-encoded canonical JSON payload */
  accessControls: string;
  /** API stage that produced this envelope */
  stage: string;
  /** Hex-encoded ECDSA signature (r‖s, 128 hex chars) */
  signature: string;
}

/**
 * Per-stage uncompressed secp256k1 public keys (hex, 130 chars each).
 * The API signs access control payloads with the corresponding private key.
 *
 * sandbox / staging  — shared key pair
 * production         — placeholder until a secure key is provisioned
 */
const PUBLIC_KEYS: Record<string, string> = {
  // Test (matches API TEST_PRIVATE_KEY_HEX in test_access_controls.py)
  test:       '04aab6c39303c2d4b20424bc8b410d00e19b006f03e7908a6b21da21889f929afe550ddf3d13ebd13d0a05b7f75eede2c306dfd56f1c1e0d1e6aa2ddf10b959370',
  // Sandbox & staging (shared)
  development:'04dc3ab0e1481720969d33463a22e67deaf563bc68e5456a88198ee2ed48935097e677ee711f8661e9965a4e1ebab2f5bf77d806a621beffad87b99ab838db6f29',
  local:      '04dc3ab0e1481720969d33463a22e67deaf563bc68e5456a88198ee2ed48935097e677ee711f8661e9965a4e1ebab2f5bf77d806a621beffad87b99ab838db6f29',
  sandbox:    '04dc3ab0e1481720969d33463a22e67deaf563bc68e5456a88198ee2ed48935097e677ee711f8661e9965a4e1ebab2f5bf77d806a621beffad87b99ab838db6f29',
  staging:    '04dc3ab0e1481720969d33463a22e67deaf563bc68e5456a88198ee2ed48935097e677ee711f8661e9965a4e1ebab2f5bf77d806a621beffad87b99ab838db6f29',
  // Production
  alpha:      '045d1a0f9c3299b75e6fe0b3569ad05343b3ee3fe4586b41b9eafe80657b403df350b77da550e446a4032feea03d90a20989032afa85b26ce2428909c3ed9a919f',
  beta:       '045d1a0f9c3299b75e6fe0b3569ad05343b3ee3fe4586b41b9eafe80657b403df350b77da550e446a4032feea03d90a20989032afa85b26ce2428909c3ed9a919f',
  production: '045d1a0f9c3299b75e6fe0b3569ad05343b3ee3fe4586b41b9eafe80657b403df350b77da550e446a4032feea03d90a20989032afa85b26ce2428909c3ed9a919f',
};

/**
 * Convert a hex string to a Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * SHA-256 hash using the Web Crypto API.
 */
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  return new Uint8Array(digest);
}

/**
 * Verify the ECDSA secp256k1 signature on a signed access controls envelope.
 *
 * @returns The decoded payload if valid.
 * @throws {Error} If verification fails for any reason.
 */
export async function verifyAccessControls(
  envelope: SignedAccessControls,
): Promise<AccessControlsPayload> {
  const publicKeyHex = PUBLIC_KEYS[envelope.stage];
  if (!publicKeyHex || publicKeyHex.startsWith('0000')) {
    throw new Error(`No valid public key for stage "${envelope.stage}"`);
  }

  // Decode the base64 payload to raw bytes
  const payloadBytes = Uint8Array.from(atob(envelope.accessControls), (c) =>
    c.charCodeAt(0),
  );

  // Hash the payload (the API signs SHA-256 of the canonical JSON)
  const messageHash = await sha256(payloadBytes);

  // Parse the r‖s hex signature into a Signature object
  const r = BigInt('0x' + envelope.signature.substring(0, 64));
  const s = BigInt('0x' + envelope.signature.substring(64, 128));
  const sig = new Signature(r, s);

  // Verify against the stage-specific public key
  const publicKeyBytes = hexToBytes(publicKeyHex);
  const valid = verify(sig, messageHash, publicKeyBytes, { lowS: false });

  if (!valid) {
    throw new Error('Access controls signature verification failed');
  }

  // Decode and parse the JSON payload
  const decoder = new TextDecoder();
  const payload: AccessControlsPayload = JSON.parse(
    decoder.decode(payloadBytes),
  );

  return payload;
}
