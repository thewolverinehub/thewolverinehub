/** Booking rules shared by the UI (the CMS enforces the same values — keep in sync with cms/src/utils/booking.ts). */

/** A pending booking holds its seat this many minutes while the member pays. */
export const HOLD_MINUTES = 15;

/** Self-service cancellation closes this many hours before the session starts. */
export const CANCEL_CUTOFF_HOURS = 12;
