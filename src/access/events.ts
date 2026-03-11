import type { FrontierSDK } from '../sdk';
import type { PaginatedResponse } from './user';

/** Event visibility type */
export type EventType = 'public' | 'members_plus_one' | 'members_only' | 'community_only';

/** External event service */
export type EventService = 'luma' | 'private' | 'test';

/** Booking review status */
export type ReviewStatus = 'not_required' | 'approved' | 'rejected' | 'pending';

/** Event lifecycle status */
export type EventStatus = 'active' | 'suspended' | 'archived';

/** Location type */
export type LocationType = 'event_space' | 'room';

/** Event object */
export interface Event {
  /** Event database ID */
  id: number;
  /** Event title */
  name: string;
  /** Event description */
  description: string;
  /** Visibility type */
  eventType: EventType;
  /** External service (luma, private, test) */
  eventService: EventService;
  /** Primary host full name */
  host: string;
  /** Community ID, or null */
  community: number | null;
  /** Start time (ISO 8601) */
  startsAt: string;
  /** End time (ISO 8601) */
  endsAt: string;
  /** Cover image URL or null */
  coverImage: string | null;
  /** External service event ID */
  eventId: string;
  /** Location readable_id slug */
  location: string;
  /** Location display name */
  locationName: string;
  /** Formatted display location */
  displayLocation: string;
  /** External event URL */
  url: string;
  /** Co-host email addresses */
  additionalHosts: string[];
  /** Hex color code, e.g. "#1E90FF" */
  color: string;
  /** Booking approval status */
  reviewStatus: ReviewStatus;
  /** Event lifecycle status */
  status: EventStatus;
}

/** Parameters for listing events */
export interface ListEventsParams {
  /** Search by event name */
  search?: string;
  /** Filter by event type */
  eventType?: EventType;
  /** Filter by location type */
  locationType?: LocationType;
  /** Filter by location readable_id */
  locationId?: string;
  /** Single date filter (YYYY-MM-DD) */
  date?: string;
  /** Range start (YYYY-MM-DD) */
  startDate?: string;
  /** Range end (YYYY-MM-DD) */
  endDate?: string;
  /** Pagination page number */
  page?: number;
}

/** Request body for creating an event */
export interface CreateEventRequest {
  /** Event title */
  name: string;
  /** Visibility type */
  eventType: EventType;
  /** Start time (ISO 8601) */
  startsAt: string;
  /** End time (ISO 8601) */
  endsAt: string;
  /** Location readable_id */
  location: string;
  /** Event description */
  description?: string;
  /** Base64 data URI cover image */
  coverImage?: string;
  /** Co-host email addresses */
  additionalHosts?: string[];
  /** Hex color code */
  color?: string;
}

/** Location object */
export interface Location {
  /** Location database ID */
  id: number;
  /** URL-safe slug identifier */
  readableId: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Directions to find the location */
  directions: string;
  /** Type of space */
  locationType: LocationType;
  /** Warmup buffer duration (ISO 8601) */
  warmupBuffer: string;
  /** Cooldown buffer duration (ISO 8601) */
  cooldownBuffer: string;
  /** Restrict to founding citizens */
  onlyFoundingCitizensCanBook: boolean;
  /** Restrict to office subscription holders */
  onlyOfficeSubscriptionHoldersCanBook: boolean;
  /** Restrict to floor leads */
  onlyFloorLeadsCanBook: boolean;
  /** Owning community ID, or null */
  owner: number | null;
  /** Floor plan image URL */
  floorLocation: string;
  /** Allow outside community to book */
  openBooking: boolean;
  /** Staff-only restriction */
  staffOnly: boolean;
  /** Maximum capacity */
  maxCapacity: number;
  /** Requires manager approval */
  requiresApproval: boolean;
}

/** Parameters for listing locations */
export interface ListLocationsParams {
  /** Filter by location type */
  locationType?: LocationType;
}

/** Room booking object */
export interface RoomBooking {
  /** Booking database ID */
  id: number;
  /** Start time (ISO 8601) */
  startsAt: string;
  /** End time (ISO 8601) */
  endsAt: string;
  /** Location readable_id */
  location: string;
  /** Host full name */
  host: string;
  /** Community ID, or null */
  community: number | null;
  /** Approval status */
  reviewStatus: ReviewStatus;
  /** Booking lifecycle status */
  status: EventStatus;
}

/** Parameters for listing room bookings */
export interface ListRoomBookingsParams {
  /** Filter by location readable_id */
  locationId?: string;
  /** Single date filter (YYYY-MM-DD) */
  date?: string;
  /** Range start (YYYY-MM-DD) */
  startDate?: string;
  /** Range end (YYYY-MM-DD) */
  endDate?: string;
  /** Pagination page number */
  page?: number;
}

/** Request body for creating a room booking */
export interface CreateRoomBookingRequest {
  /** Start time (ISO 8601) */
  startsAt: string;
  /** End time (ISO 8601) */
  endsAt: string;
  /** Location readable_id (must be ROOM type) */
  location: string;
}

/**
 * Events access class for managing events, locations, and room bookings
 *
 * Provides methods to:
 * - List and create events
 * - Add co-hosts to events
 * - List available locations (event spaces and rooms)
 * - List and create room bookings
 *
 * All methods require authentication and appropriate permissions.
 */
export class EventsAccess {
  constructor(private sdk: FrontierSDK) {}

  /**
   * List events with optional filters
   *
   * Returns a paginated list of active events. Results are filtered by
   * user role and community membership.
   *
   * @param payload - Optional filter parameters
   * @returns Paginated response of Event objects
   *
   * @example
   * ```typescript
   * const events = await sdk.getEvents().listEvents();
   * console.log('Total events:', events.count);
   *
   * // With filters
   * const filtered = await sdk.getEvents().listEvents({
   *   eventType: 'public',
   *   startDate: '2025-06-01',
   *   endDate: '2025-06-30',
   * });
   * ```
   */
  async listEvents(payload?: ListEventsParams): Promise<PaginatedResponse<Event>> {
    return this.sdk.request('events:listEvents', payload);
  }

  /**
   * Create a new event
   *
   * @param payload - Event creation data
   * @returns The created Event
   * @throws {Error} If validation fails or there is a booking conflict
   *
   * @example
   * ```typescript
   * const event = await sdk.getEvents().createEvent({
   *   name: 'Community Meetup',
   *   eventType: 'public',
   *   startsAt: '2025-06-15T18:00:00Z',
   *   endsAt: '2025-06-15T20:00:00Z',
   *   location: 'spaceship',
   * });
   * console.log('Created event:', event.id);
   * ```
   */
  async createEvent(payload: CreateEventRequest): Promise<Event> {
    return this.sdk.request('events:createEvent', payload);
  }

  /**
   * Add an additional host (co-host) to an event
   *
   * Only the primary event host can add co-hosts, and only to upcoming events.
   *
   * @param payload.eventId - Event database ID
   * @param payload.email - Email address of the new co-host
   * @returns The updated Event
   * @throws {Error} If not the event host or event is in the past
   *
   * @example
   * ```typescript
   * const updated = await sdk.getEvents().addEventHost({
   *   eventId: 42,
   *   email: 'cohost@example.com',
   * });
   * console.log('Hosts:', updated.additionalHosts);
   * ```
   */
  async addEventHost(payload: { eventId: number; email: string }): Promise<Event> {
    return this.sdk.request('events:addEventHost', payload);
  }

  /**
   * List available locations with optional type filter
   *
   * Returns all locations the user has access to. Results are filtered
   * by user role, community membership, and booking restrictions.
   *
   * @param payload - Optional filter parameters
   * @returns Array of Location objects (not paginated)
   *
   * @example
   * ```typescript
   * const locations = await sdk.getEvents().listLocations();
   * console.log('Available locations:', locations.map(l => l.name));
   *
   * // Filter by type
   * const rooms = await sdk.getEvents().listLocations({ locationType: 'room' });
   * ```
   */
  async listLocations(payload?: ListLocationsParams): Promise<Location[]> {
    return this.sdk.request('events:listLocations', payload);
  }

  /**
   * List room bookings with optional filters
   *
   * Returns paginated list of approved room bookings.
   *
   * @param payload - Optional filter parameters
   * @returns Paginated response of RoomBooking objects
   *
   * @example
   * ```typescript
   * const bookings = await sdk.getEvents().listRoomBookings({
   *   locationId: 'room-201',
   *   date: '2025-06-10',
   * });
   * ```
   */
  async listRoomBookings(payload?: ListRoomBookingsParams): Promise<PaginatedResponse<RoomBooking>> {
    return this.sdk.request('events:listRoomBookings', payload);
  }

  /**
   * Create a new room booking
   *
   * @param payload - Room booking creation data
   * @returns The created RoomBooking
   * @throws {Error} If validation fails or there is a booking conflict
   *
   * @example
   * ```typescript
   * const booking = await sdk.getEvents().createRoomBooking({
   *   startsAt: '2025-06-20T14:00:00Z',
   *   endsAt: '2025-06-20T15:00:00Z',
   *   location: 'room-201',
   * });
   * console.log('Booked:', booking.id);
   * ```
   */
  async createRoomBooking(payload: CreateRoomBookingRequest): Promise<RoomBooking> {
    return this.sdk.request('events:createRoomBooking', payload);
  }
}
