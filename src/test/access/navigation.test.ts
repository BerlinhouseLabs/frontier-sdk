import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationAccess } from '../../access/navigation';
import type { FrontierSDK } from '../../sdk';

describe('NavigationAccess', () => {
  let navigationAccess: NavigationAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    navigationAccess = new NavigationAccess(mockSDK);
  });

  it('should request host app navigation', async () => {
    vi.mocked(mockSDK.request).mockResolvedValue(undefined);

    await navigationAccess.openApp('fiat-rails', {
      path: '/scan',
      params: { amount: '50' },
    });

    expect(mockSDK.request).toHaveBeenCalledWith('navigation:openApp', {
      appId: 'fiat-rails',
      path: '/scan',
      params: { amount: '50' },
    });
  });

  it('should request host external URL navigation', async () => {
    vi.mocked(mockSDK.request).mockResolvedValue(undefined);

    await navigationAccess.openExternalUrl('https://frontiertower.io/apply');

    expect(mockSDK.request).toHaveBeenCalledWith('navigation:openExternalUrl', {
      url: 'https://frontiertower.io/apply',
    });
  });

  it('should request host app close', async () => {
    vi.mocked(mockSDK.request).mockResolvedValue(undefined);

    await navigationAccess.close();

    expect(mockSDK.request).toHaveBeenCalledWith('navigation:close');
  });
});
