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
  /** True iff the requesting user is this event's host (the user the deposit endpoints authorize). */
  isHost?: boolean;
  /** Read-only security-deposit summary, or null when the event has no deposit row. */
  deposit?: EventDeposit | null;
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
  /** Owning community ID, or null */
  owner: number | null;
  /** URL-safe slug identifier (e.g. "spaceship", "room-201") */
  readableId: string;
  /** Display name */
  name: string;
  /** Maximum capacity */
  maxCapacity: number;
  /** Description */
  description: string;
  /** Directions to find the location */
  directions: string;
  /** Type of space */
  locationType: LocationType;
  /** Warmup buffer duration (e.g. "00:10:00" = 10 min) */
  warmupBuffer: string;
  /** Cooldown buffer duration (e.g. "00:15:00" = 15 min) */
  cooldownBuffer: string;
  /** Allow users outside owner community to book */
  openBooking: boolean;
  /** Floor plan image URL */
  floorLocation: string;
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
 * Compact security-deposit status exposed read-only on the event payload (for host UI gating).
 * The "secure deposit" CTA keys off `required` (optionally `pending`); `failed` is terminal.
 */
export type DepositStatus =
  | 'not_required'
  | 'required'
  | 'pending'
  | 'secured'
  | 'released'
  | 'withheld'
  | 'failed';

/** Read-only security-deposit summary on the event payload (null when the event has no deposit). */
export interface EventDeposit {
  /** Compact deposit lifecycle status. */
  status: DepositStatus;
  /** Snapshotted deposit amount in `currency` (e.g. 400 for the FND rail). */
  amount: number;
  /** Currency code, e.g. "usd". */
  currency: string;
}

/** A candidate token for the FND deposit, in preference order (iFND first, then public FND). */
export interface DepositPreflightToken {
  /** Token key, e.g. "ifnd_token" or "fnd_token". */
  key: string;
  /** ERC-20 contract address to approve the allowance on. */
  address: string;
  /** On-chain token decimals (read from the contract, never assumed). */
  decimals: number;
  /** Deposit amount in this token's base units, as a decimal string (pass to approveERC20 as a BigInt). */
  baseUnits: string;
}

/**
 * Response of `getCryptoDepositPreflight` — everything needed to approve the right ERC-20
 * allowance to `spender` before placing the deposit. Read-only.
 */
export interface DepositPreflight {
  /** Address to approve the allowance to (the platform treasury / spender). Never hardcode it. */
  spender: string;
  /** Network key, e.g. "base" (prod) or "base_sepolia" (sandbox). */
  network: string;
  /** Deposit amount in `currency`, as a decimal string (e.g. "400.00"). */
  amount: string;
  /** Currency code, e.g. "usd". */
  currency: string;
  /** Candidate tokens in preference order: iFND first, then public FND. */
  tokens: DepositPreflightToken[];
}

/** Raw deposit status returned by `placeCryptoDeposit`. */
export type CryptoDepositStatus =
  | 'secured'
  | 'awaiting_payment'
  | 'grant'
  | 'released'
  | 'withheld'
  | 'failed';

/**
 * Result of `placeCryptoDeposit`. `secured` → the deposit is collected (`reference` is the tx
 * hash); `awaiting_payment` → the on-chain transfer couldn't complete (insufficient allowance or
 * balance in both iFND and FND) — fix per `statusReason` and retry.
 */
export interface DepositResult {
  /** Always 'crypto' on this rail. */
  provider: 'crypto';
  /** Deposit status. */
  status: CryptoDepositStatus;
  /** Deposit amount in `currency`, as a decimal string. */
  amount: string;
  /** Currency code, e.g. "usd". */
  currency: string;
  /** On-chain tx hash when secured; empty otherwise. */
  reference: string;
  /** Human-readable reason when not secured (e.g. insufficient iFND/FND allowance or balance). */
  statusReason: string;
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

  /**
   * Preflight an event's FND security deposit — returns the spender, network, amount, and the
   * candidate tokens (iFND first, then FND) with on-chain decimals + base-unit amounts. Read-only;
   * the event host only. Use it to approve the correct ERC-20 allowance before placing the
   * deposit; never hardcode the spender or token addresses.
   *
   * @param payload.eventId - Event database ID
   * @returns Preflight data for approving the deposit allowance
   * @throws {Error} If not authenticated, not the host, or no deposit is required
   *
   * @example
   * ```typescript
   * // 1. Preflight — discover the spender + candidate tokens (iFND first, then FND)
   * const { spender, tokens } = await sdk.getEvents().getCryptoDepositPreflight({ eventId: 42 });
   * const token = tokens[0]; // prefer iFND; fall back to tokens[1] (FND) if the member lacks iFND
   * // 2. Approve the allowance to the spender (on-chain; the member confirms in the wallet)
   * await sdk.getWallet().approveERC20(token.address, spender, BigInt(token.baseUnits));
   * // 3. Place the deposit — the backend transferFroms it into treasury
   * const result = await sdk.getEvents().placeCryptoDeposit({ eventId: 42 });
   * ```
   */
  async getCryptoDepositPreflight(payload: { eventId: number }): Promise<DepositPreflight> {
    return this.sdk.request('events:getCryptoDepositPreflight', payload);
  }

  /**
   * Place an event's FND security deposit. The backend transferFroms the stablecoin from the
   * member's own deployed smart account into treasury — the member must have approved the
   * allowance to the preflight `spender` first (via `getWallet().approveERC20`). Host only; no body.
   *
   * @param payload.eventId - Event database ID
   * @returns The deposit result — `status: 'secured'` (done; `reference` is the tx hash) or
   *          `'awaiting_payment'` (insufficient iFND/FND allowance or balance — read
   *          `statusReason`, fix it, and retry)
   * @throws {Error} If not authenticated, not the host, or the deposit is already resolved
   *
   * @example
   * ```typescript
   * const result = await sdk.getEvents().placeCryptoDeposit({ eventId: 42 });
   * if (result.status === 'secured') {
   *   console.log('Deposit secured, tx:', result.reference);
   * } else if (result.status === 'awaiting_payment') {
   *   console.warn('Not secured:', result.statusReason); // approve / top up, then retry
   * }
   * ```
   */
  async placeCryptoDeposit(payload: { eventId: number }): Promise<DepositResult> {
    return this.sdk.request('events:placeCryptoDeposit', payload);
  }
}
