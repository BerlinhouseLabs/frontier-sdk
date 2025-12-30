import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ThirdPartyAccess,
  type Developer,
  type UpdateDeveloperRequest,
  type RotateKeyResponse,
  type App,
  type CreateAppRequest,
  type UpdateAppRequest,
  type Webhook,
  type WebhookConfig,
  type CreateWebhookRequest,
  type UpdateWebhookRequest,
  type RotateWebhookKeyResponse,
} from '../../access/third-party';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

describe('ThirdPartyAccess', () => {
  let thirdPartyAccess: ThirdPartyAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    thirdPartyAccess = new ThirdPartyAccess(mockSDK);
  });

  // ===========================================================================
  // Developer Methods
  // ===========================================================================

  describe('listDevelopers', () => {
    it('should request developers list', async () => {
      const mockResponse: PaginatedResponse<Developer> = {
        count: 1,
        results: [{ id: 1 } as Developer],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listDevelopers({ limit: 10, offset: 0 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listDevelopers', { limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<Developer> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listDevelopers();

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listDevelopers', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDeveloper', () => {
    it('should request a developer by id', async () => {
      const mockDeveloper: Developer = { id: 42 } as Developer;
      vi.mocked(mockSDK.request).mockResolvedValue(mockDeveloper);

      const result = await thirdPartyAccess.getDeveloper({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:getDeveloper', { id: 42 });
      expect(result).toEqual(mockDeveloper);
    });
  });

  describe('updateDeveloper', () => {
    it('should request developer update', async () => {
      const data: UpdateDeveloperRequest = {
        name: 'New Name',
        description: 'New Description',
        email: 'new@example.com',
      };
      const mockDeveloper: Developer = { id: 42, name: 'New Name', description: 'New Description' } as Developer;

      vi.mocked(mockSDK.request).mockResolvedValue(mockDeveloper);

      const result = await thirdPartyAccess.updateDeveloper({ id: 42, data });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:updateDeveloper', { id: 42, data });
      expect(result).toEqual(mockDeveloper);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(thirdPartyAccess.updateDeveloper({
        id: 42,
        data: { name: 'Test' },
      })).rejects.toThrow('Permission denied');
    });
  });

  describe('rotateDeveloperApiKey', () => {
    it('should request API key rotation', async () => {
      const mockResponse: RotateKeyResponse = {
        message: 'API key rotated successfully',
        developer: { id: 42, apiKey: 'new-api-key-123' } as Developer,
      };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.rotateDeveloperApiKey({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:rotateDeveloperApiKey', { id: 42 });
      expect(result).toEqual(mockResponse);
    });
  });

  // ===========================================================================
  // App Methods
  // ===========================================================================

  describe('listApps', () => {
    it('should request apps list', async () => {
      const mockResponse: PaginatedResponse<App> = {
        count: 1,
        results: [{ id: 1 } as App],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listApps({ limit: 10, offset: 0 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listApps', { limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<App> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listApps();

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listApps', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should filter by developerId', async () => {
      const mockResponse: PaginatedResponse<App> = {
        count: 2,
        results: [{ id: 1, developer: 123 } as App, { id: 2, developer: 123 } as App],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listApps({ developerId: 123 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listApps', { developerId: 123 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createApp', () => {
    it('should request app creation', async () => {
      const payload: CreateAppRequest = {
        developer: 123,
        url: 'https://myapp.example.com',
        cnameEntry: 'app.myapp.example.com',
        permissions: ['wallet:getBalance', 'storage:get'],
        permissionDisclaimer: 'This app needs access to your wallet balance.',
      };
      const mockApp: App = { id: 1, url: 'https://myapp.example.com' } as App;

      vi.mocked(mockSDK.request).mockResolvedValue(mockApp);

      const result = await thirdPartyAccess.createApp(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:createApp', payload);
      expect(result).toEqual(mockApp);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(thirdPartyAccess.createApp({
        developer: 123,
        url: 'https://myapp.example.com',
        cnameEntry: 'app.myapp.example.com',
        permissions: ['wallet:getBalance'],
        permissionDisclaimer: 'Test disclaimer',
      })).rejects.toThrow('Permission denied');
    });
  });

  describe('getApp', () => {
    it('should request an app by id', async () => {
      const mockApp: App = { id: 42 } as App;
      vi.mocked(mockSDK.request).mockResolvedValue(mockApp);

      const result = await thirdPartyAccess.getApp({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:getApp', { id: 42 });
      expect(result).toEqual(mockApp);
    });
  });

  describe('updateApp', () => {
    it('should request app update', async () => {
      const data: UpdateAppRequest = {
        url: 'https://updated.example.com',
        permissions: ['wallet:getBalance'],
        permissionDisclaimer: 'Updated disclaimer',
      };
      const mockApp: App = { id: 42, url: 'https://updated.example.com' } as App;

      vi.mocked(mockSDK.request).mockResolvedValue(mockApp);

      const result = await thirdPartyAccess.updateApp({ id: 42, data });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:updateApp', { id: 42, data });
      expect(result).toEqual(mockApp);
    });
  });

  describe('deleteApp', () => {
    it('should request app deletion', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await thirdPartyAccess.deleteApp({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:deleteApp', { id: 42 });
    });
  });

  // ===========================================================================
  // Webhook Methods
  // ===========================================================================

  describe('listWebhooks', () => {
    it('should request webhooks list', async () => {
      const mockResponse: PaginatedResponse<Webhook> = {
        count: 1,
        results: [{ id: 1 } as Webhook],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listWebhooks({ limit: 10, offset: 0 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listWebhooks', { limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      const mockResponse: PaginatedResponse<Webhook> = {
        count: 0,
        results: [],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listWebhooks();

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listWebhooks', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should filter by developerId', async () => {
      const mockResponse: PaginatedResponse<Webhook> = {
        count: 2,
        results: [{ id: 1, developer: 123 } as Webhook, { id: 2, developer: 123 } as Webhook],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.listWebhooks({ developerId: 123 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:listWebhooks', { developerId: 123 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createWebhook', () => {
    it('should request webhook creation', async () => {
      const config: WebhookConfig = {
        events: ['app.approved', 'user.registered'],
        scope: { apps: '*' },
      };
      const payload: CreateWebhookRequest = {
        developer: 123,
        name: 'My Webhook',
        description: 'Webhook for app events',
        targetUrl: 'https://myapp.example.com/webhooks',
        config,
      };
      const mockWebhook: Webhook = { id: 1, targetUrl: payload.targetUrl } as Webhook;

      vi.mocked(mockSDK.request).mockResolvedValue(mockWebhook);

      const result = await thirdPartyAccess.createWebhook(payload);

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:createWebhook', payload);
      expect(result).toEqual(mockWebhook);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(thirdPartyAccess.createWebhook({
        developer: 123,
        name: 'Test Webhook',
        description: 'Test description',
        targetUrl: 'https://myapp.example.com/webhooks',
        config: { events: ['app.approved'], scope: {} },
      })).rejects.toThrow('Permission denied');
    });
  });

  describe('getWebhook', () => {
    it('should request a webhook by id', async () => {
      const mockWebhook: Webhook = { id: 42 } as Webhook;
      vi.mocked(mockSDK.request).mockResolvedValue(mockWebhook);

      const result = await thirdPartyAccess.getWebhook({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:getWebhook', { id: 42 });
      expect(result).toEqual(mockWebhook);
    });
  });

  describe('updateWebhook', () => {
    it('should request webhook update', async () => {
      const data: UpdateWebhookRequest = {
        name: 'Updated Webhook',
        targetUrl: 'https://newurl.example.com/webhooks',
        config: { events: ['app.approved'], scope: { apps: [1, 2, 3] } },
      };
      const mockWebhook: Webhook = { id: 42, targetUrl: data.targetUrl } as Webhook;

      vi.mocked(mockSDK.request).mockResolvedValue(mockWebhook);

      const result = await thirdPartyAccess.updateWebhook({ id: 42, data });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:updateWebhook', { id: 42, data });
      expect(result).toEqual(mockWebhook);
    });
  });

  describe('deleteWebhook', () => {
    it('should request webhook deletion', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue(undefined);

      await thirdPartyAccess.deleteWebhook({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:deleteWebhook', { id: 42 });
    });
  });

  describe('rotateWebhookSigningKey', () => {
    it('should request webhook signing key rotation', async () => {
      const mockResponse: RotateWebhookKeyResponse = {
        message: 'Signing key rotated successfully',
        webhook: { id: 42, signingPublicKey: 'new-public-key-123' } as Webhook,
      };
      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await thirdPartyAccess.rotateWebhookSigningKey({ id: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('thirdParty:rotateWebhookSigningKey', { id: 42 });
      expect(result).toEqual(mockResponse);
    });
  });
});
