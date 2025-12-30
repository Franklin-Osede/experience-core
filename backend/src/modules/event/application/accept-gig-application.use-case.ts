import { Inject, Injectable } from '@nestjs/common';
import {
  GIG_APPLICATION_REPOSITORY,
  GigApplicationRepository,
} from '../domain/gig-application.repository';
import {
  VENUE_AVAILABILITY_REPOSITORY,
  VenueAvailabilityRepository,
} from '../domain/venue-availability.repository';
import { EventRepository } from '../domain/event.repository';
import { Event } from '../domain/event.entity';
import { EventType } from '../domain/event-type.enum';
import { EventGenre } from '../domain/event-genre.enum';

interface AcceptGigDto {
  applicationId: string;
  eventTitle: string;
  eventType: EventType;
  eventGenre?: EventGenre;
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class AcceptGigApplicationUseCase {
  constructor(
    @Inject(GIG_APPLICATION_REPOSITORY)
    private readonly applicationRepository: GigApplicationRepository,
    @Inject(VENUE_AVAILABILITY_REPOSITORY)
    private readonly availabilityRepository: VenueAvailabilityRepository,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(dto: AcceptGigDto): Promise<Event> {
    // 1. Get Application
    const application = await this.applicationRepository.findById(
      dto.applicationId,
    );
    if (!application) throw new Error('Application not found');

    // 2. Get Availability
    const availability = await this.availabilityRepository.findById(
      application.availabilityId,
    );
    if (!availability) throw new Error('Availability not found');

    // 3. Mark Deal as Done
    application.accept();
    availability.book();

    await this.applicationRepository.save(application);
    await this.availabilityRepository.save(availability);

    // 4. Create the Draft Event
    const event = Event.create({
      organizerId: application.djId,
      title: dto.eventTitle,
      description: application.proposal, // Proposal becomes description initially
      type: dto.eventType,
      genre: dto.eventGenre || EventGenre.OPEN_FORMAT,
      startTime: dto.startTime,
      endTime: dto.endTime,
      location: 'TBD', // Venue address would be fetched here in real app
      venueId: availability.venueId,
      maxCapacity: 100, // Placeholder
    });

    await this.eventRepository.save(event);

    return event;
  }
}
