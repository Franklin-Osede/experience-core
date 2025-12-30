import { UserAttendedEventEvent } from '../../event/domain/events/user-attended-event.event';
import { UserRepository } from '../domain/user.repository';
export declare class UserAttendedEventListener {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    handle(event: UserAttendedEventEvent): Promise<void>;
}
