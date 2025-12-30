export declare class UserCreatedEvent {
    readonly userId: string;
    readonly email: string;
    readonly role: string;
    constructor(userId: string, email: string, role: string);
}
