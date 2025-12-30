export class UserAttendedEventEvent {
  constructor(
    public readonly userId: string,
    public readonly eventId: string,
  ) {}
}
