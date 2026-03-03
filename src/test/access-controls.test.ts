import { describe, it, expect } from 'vitest';
import { verifyAccessControls, type SignedAccessControls } from '../access-controls';

// Test fixture: signed by API's TEST_PRIVATE_KEY_HEX (4c0883a...)
// Public key for stage "test" is hardcoded in access-controls.ts
const VALID_ENVELOPE: SignedAccessControls = {
  accessControls: 'eyJhZGRPbnMiOlsiZ2xvYmV0cm90dGVyIl0sImNvbW11bml0aWVzIjpbImFydHMtbXVzaWMiXSwiZW1haWwiOiJ0ZXN0QGZyb250aWVyLmNvbSIsImlzU3RhZmYiOmZhbHNlLCJpc1N1cGVydXNlciI6ZmFsc2UsImtpZCI6InYxIiwibWFuYWdlZENvbW11bml0aWVzIjpbXSwic21hcnRBY2NvdW50QWRkcmVzcyI6IjB4MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3OCIsInN1YnNjcmlwdGlvbkludGVydmFsIjoibW9udGhseSIsInN1YnNjcmlwdGlvblBsYW4iOiJjaXRpemVuIiwic3Vic2NyaXB0aW9uU3RhdHVzIjoiYWN0aXZlIiwic3Vic2NyaXB0aW9uVHlwZSI6ImNyeXB0byIsInRpbWVzdGFtcCI6IjIwMjUtMDEtMDFUMDA6MDA6MDArMDA6MDAifQ==',
  stage: 'test',
  signature: '035c41587812bad2f2aa4e33fe8e980a1a8818e67441b7da43f549c0fdfad29b661a003a87ca6d4c0eb17a90cee47d3908065018c84c405074bd85e10ded8dcf',
};

describe('verifyAccessControls', () => {
  it('should verify a valid signed envelope and return the payload', async () => {
    const payload = await verifyAccessControls(VALID_ENVELOPE);

    expect(payload.email).toBe('test@frontier.com');
    expect(payload.isStaff).toBe(false);
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
