import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EventsAccess,
  type Event,
  type Location,
  type RoomBooking,
  type ListEventsParams,
  type CreateEventRequest,
  type CreateRoomBookingRequest,
  type DepositPreflight,
  type DepositResult,
} from '../../access/events';
import type { FrontierSDK } from '../../sdk';
import type { PaginatedResponse } from '../../access/user';

describe('EventsAccess', () => {
  let eventsAccess: EventsAccess;
  let mockSDK: FrontierSDK;

  beforeEach(() => {
    mockSDK = {
      request: vi.fn(),
    } as any;

    eventsAccess = new EventsAccess(mockSDK);
  });

  describe('listEvents', () => {
    it('should request events with filter params', async () => {
      const mockResponse: PaginatedResponse<Event> = {
        count: 1,
        results: [{
          id: 1, name: 'Meetup', description: '', eventType: 'public', eventService: 'luma',
          host: 'Jane', community: null, startsAt: '2025-06-01T18:00:00Z', endsAt: '2025-06-01T20:00:00Z',
          coverImage: null, eventId: 'luma-abc', location: 'spaceship', locationName: 'Spaceship',
          displayLocation: 'Frontier Tower @ Spaceship', url: 'https://lu.ma/abc', additionalHosts: [],
          color: '#1E90FF', reviewStatus: 'approved', status: 'active',
        }],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const params: ListEventsParams = { eventType: 'public', page: 1 };
      const result = await eventsAccess.listEvents(params);

      expect(mockSDK.request).toHaveBeenCalledWith('events:listEvents', params);
      expect(result).toEqual(mockResponse);
    });

    it('should allow calling without payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue({ count: 0, results: [] });

      await eventsAccess.listEvents();

      expect(mockSDK.request).toHaveBeenCalledWith('events:listEvents', undefined);
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Permission denied'));

      await expect(eventsAccess.listEvents()).rejects.toThrow('Permission denied');
    });
  });

  describe('createEvent', () => {
    it('should request event creation', async () => {
      const mockEvent: Event = {
        id: 1, name: 'Meetup', description: '', eventType: 'public', eventService: 'luma',
        host: 'Jane', community: null, startsAt: '2025-06-01T18:00:00Z', endsAt: '2025-06-01T20:00:00Z',
        coverImage: null, eventId: 'luma-abc', location: 'spaceship', locationName: 'Spaceship',
        displayLocation: 'Frontier Tower @ Spaceship', url: 'https://lu.ma/abc', additionalHosts: [],
        color: '#1E90FF', reviewStatus: 'approved', status: 'active',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockEvent);

      const data: CreateEventRequest = {
        name: 'Meetup', eventType: 'public',
        startsAt: '2025-06-01T18:00:00Z', endsAt: '2025-06-01T20:00:00Z', location: 'spaceship',
      };

      const result = await eventsAccess.createEvent(data);

      expect(mockSDK.request).toHaveBeenCalledWith('events:createEvent', data);
      expect(result.id).toBe(1);
    });

    it('should propagate conflict errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Booking conflict'));

      await expect(eventsAccess.createEvent({
        name: 'X', eventType: 'public', startsAt: '', endsAt: '', location: 'spaceship',
      })).rejects.toThrow('Booking conflict');
    });
  });

  describe('addEventHost', () => {
    it('should request adding a host with correct payload', async () => {
      const mockEvent: Event = {
        id: 1, name: 'Meetup', description: '', eventType: 'public', eventService: 'luma',
        host: 'Jane', community: null, startsAt: '2025-06-01T18:00:00Z', endsAt: '2025-06-01T20:00:00Z',
        coverImage: null, eventId: 'luma-abc', location: 'spaceship', locationName: 'Spaceship',
        displayLocation: 'Frontier Tower @ Spaceship', url: 'https://lu.ma/abc',
        additionalHosts: ['cohost@example.com'], color: '#1E90FF', reviewStatus: 'approved', status: 'active',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockEvent);

      const result = await eventsAccess.addEventHost({ eventId: 1, email: 'cohost@example.com' });

      expect(mockSDK.request).toHaveBeenCalledWith('events:addEventHost', { eventId: 1, email: 'cohost@example.com' });
      expect(result.additionalHosts).toContain('cohost@example.com');
    });

    it('should propagate forbidden errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Forbidden'));

      await expect(eventsAccess.addEventHost({ eventId: 1, email: 'x@y.com' })).rejects.toThrow('Forbidden');
    });
  });

  describe('listLocations', () => {
    it('should request locations with filter', async () => {
      const mockLocations: Location[] = [{
        id: 1, owner: null, readableId: 'spaceship', name: 'Spaceship', maxCapacity: 100,
        description: 'Main event space', directions: '3rd floor', locationType: 'event_space',
        warmupBuffer: '00:10:00', cooldownBuffer: '00:15:00', openBooking: false, floorLocation: '',
      }];

      vi.mocked(mockSDK.request).mockResolvedValue(mockLocations);

      const result = await eventsAccess.listLocations({ locationType: 'event_space' });

      expect(mockSDK.request).toHaveBeenCalledWith('events:listLocations', { locationType: 'event_space' });
      expect(result).toHaveLength(1);
    });

    it('should allow calling without payload', async () => {
      vi.mocked(mockSDK.request).mockResolvedValue([]);

      await eventsAccess.listLocations();

      expect(mockSDK.request).toHaveBeenCalledWith('events:listLocations', undefined);
    });
  });

  describe('listRoomBookings', () => {
    it('should request room bookings with filters', async () => {
      const mockResponse: PaginatedResponse<RoomBooking> = {
        count: 1,
        results: [{
          id: 1, startsAt: '2025-06-10T14:00:00Z', endsAt: '2025-06-10T15:00:00Z',
          location: 'room-201',
        }],
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockResponse);

      const result = await eventsAccess.listRoomBookings({ locationId: 'room-201', date: '2025-06-10' });

      expect(mockSDK.request).toHaveBeenCalledWith('events:listRoomBookings', { locationId: 'room-201', date: '2025-06-10' });
      expect(result.results[0].location).toBe('room-201');
    });
  });

  describe('createRoomBooking', () => {
    it('should request room booking creation', async () => {
      const mockBooking: RoomBooking = {
        id: 1, startsAt: '2025-06-20T14:00:00Z', endsAt: '2025-06-20T15:00:00Z',
        location: 'room-201',
      };

      vi.mocked(mockSDK.request).mockResolvedValue(mockBooking);

      const data: CreateRoomBookingRequest = {
        startsAt: '2025-06-20T14:00:00Z', endsAt: '2025-06-20T15:00:00Z', location: 'room-201',
      };

      const result = await eventsAccess.createRoomBooking(data);

      expect(mockSDK.request).toHaveBeenCalledWith('events:createRoomBooking', data);
      expect(result.id).toBe(1);
    });

    it('should propagate conflict errors', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Booking conflict'));

      await expect(eventsAccess.createRoomBooking({
        startsAt: '', endsAt: '', location: 'room-201',
      })).rejects.toThrow('Booking conflict');
    });
  });

  describe('getCryptoDepositPreflight', () => {
    it('should request the preflight with the eventId payload', async () => {
      const preflight: DepositPreflight = {
        spender: '0x1111111111111111111111111111111111111111',
        network: 'base_sepolia',
        amount: '400.00',
        currency: 'usd',
        tokens: [
          { key: 'ifnd_token', address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', decimals: 6, baseUnits: '400000000' },
          { key: 'fnd_token', address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', decimals: 6, baseUnits: '400000000' },
        ],
      };
      vi.mocked(mockSDK.request).mockResolvedValue(preflight);

      const result = await eventsAccess.getCryptoDepositPreflight({ eventId: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('events:getCryptoDepositPreflight', { eventId: 42 });
      expect(result.tokens[0].key).toBe('ifnd_token');
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Only the event host can set up the deposit'));

      await expect(eventsAccess.getCryptoDepositPreflight({ eventId: 42 })).rejects.toThrow('Only the event host');
    });
  });

  describe('placeCryptoDeposit', () => {
    it('should request placing the deposit and return secured', async () => {
      const placed: DepositResult = {
        provider: 'crypto', status: 'secured', amount: '400.00', currency: 'usd',
        reference: '0xabc123txhash', statusReason: '',
      };
      vi.mocked(mockSDK.request).mockResolvedValue(placed);

      const result = await eventsAccess.placeCryptoDeposit({ eventId: 42 });

      expect(mockSDK.request).toHaveBeenCalledWith('events:placeCryptoDeposit', { eventId: 42 });
      expect(result.status).toBe('secured');
      expect(result.reference).toBe('0xabc123txhash');
    });

    it('should return awaiting_payment with a reason', async () => {
      const awaiting: DepositResult = {
        provider: 'crypto', status: 'awaiting_payment', amount: '400.00', currency: 'usd',
        reference: '', statusReason: 'Insufficient iFND/FND allowance or balance for the deposit.',
      };
      vi.mocked(mockSDK.request).mockResolvedValue(awaiting);

      const result = await eventsAccess.placeCryptoDeposit({ eventId: 42 });

      expect(result.status).toBe('awaiting_payment');
      expect(result.statusReason).toContain('Insufficient');
    });

    it('should propagate errors from SDK', async () => {
      vi.mocked(mockSDK.request).mockRejectedValue(new Error('Deposit already secured'));

      await expect(eventsAccess.placeCryptoDeposit({ eventId: 42 })).rejects.toThrow('already secured');
    });
  });
});
