const EVENTS = {
  PASSWORD_RESET_REQUESTED: 'password.reset.requested',
  USER_REGISTERED: 'user.registered',
} as const;

export type EventName = typeof EVENTS[keyof typeof EVENTS];
export default EVENTS;
