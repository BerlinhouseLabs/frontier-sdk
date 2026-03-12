import { describe, it, expect } from 'vitest';
import { verifyAccessControls, type SignedAccessControls } from '../access-controls';

// Test fixture: signed by API's TEST_PRIVATE_KEY_HEX (4c0883a...)
// Public key for stage "test" is hardcoded in access-controls.ts
const VALID_ENVELOPE: SignedAccessControls = {
  accessControls: 'eyJhZGRPbnMiOlsiZ2xvYmV0cm90dGVyIl0sImNvbW11bml0aWVzIjpbImFydHMtbXVzaWMiXSwiZW1haWwiOiJ0ZXN0QGZyb250aWVyLmNvbSIsImlzU3VwZXJ1c2VyIjpmYWxzZSwia2lkIjoidjEiLCJtYW5hZ2VkQ29tbXVuaXRpZXMiOltdLCJzbWFydEFjY291bnRBZGRyZXNzIjoiMHgxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4Iiwic3Vic2NyaXB0aW9uSW50ZXJ2YWwiOiJtb250aGx5Iiwic3Vic2NyaXB0aW9uUGxhbiI6ImNpdGl6ZW4iLCJzdWJzY3JpcHRpb25TdGF0dXMiOiJhY3RpdmUiLCJzdWJzY3JpcHRpb25UeXBlIjoiY3J5cHRvIiwidGltZXN0YW1wIjoiMjAyNS0wMS0wMVQwMDowMDowMCswMDowMCJ9',
  stage: 'test',
  signature: 'd6f3cd55298d8d227778d5ba8881e2fbc48dfc2534758a1a34f97ac1f6c98658248ed38031ff7840de6ef07bd2d4ed7798d758033502f10a0f5e2f1808cb8eb3',
};

describe('verifyAccessControls', () => {
  it('should verify a valid signed envelope and return the payload', async () => {
    const payload = await verifyAccessControls(VALID_ENVELOPE);

    expect(payload.email).toBe('test@frontier.com');
    expect(payload.isSuperuser).toBe(false);
    expect(payload.subscriptionStatus).toBe('active');
    expect(payload.subscriptionPlan).toBe('citizen');
    expect(payload.subscriptionInterval).toBe('monthly');
    expect(payload.subscriptionType).toBe('crypto');
    expect(payload.smartAccountAddress).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(payload.addOns).toEqual(['globetrotter']);
    expect(payload.communities).toEqual(['arts-music']);
    expect(payload.managedCommunities).toEqual([]);
    expect(payload.kid).toBe('v1');
    expect(payload.timestamp).toBe('2025-01-01T00:00:00+00:00');
  });

  it('should throw on tampered payload', async () => {
    // Flip one character in the base64 payload
    const tampered: SignedAccessControls = {
      ...VALID_ENVELOPE,
      accessControls: VALID_ENVELOPE.accessControls.slice(0, -2) + 'XX',
    };

    await expect(verifyAccessControls(tampered)).rejects.toThrow();
  });

  it('should throw on tampered signature', async () => {
    const tampered: SignedAccessControls = {
      ...VALID_ENVELOPE,
      signature: 'aa' + VALID_ENVELOPE.signature.slice(2),
    };

    await expect(verifyAccessControls(tampered)).rejects.toThrow();
  });

  it('should throw for unknown stage', async () => {
    const unknownStage: SignedAccessControls = {
      ...VALID_ENVELOPE,
      stage: 'nonexistent',
    };

    await expect(verifyAccessControls(unknownStage)).rejects.toThrow(
      'No valid public key for stage "nonexistent"',
    );
  });

});
