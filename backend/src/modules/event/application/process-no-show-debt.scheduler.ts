import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessNoShowDebtUseCase } from './process-no-show-debt.use-case';
import { EventRepository } from '../domain/event.repository';
import { EventStatus } from '../domain/event-status.enum';

/**
 * Scheduler that runs daily to process no-show debts for completed events
 * Runs at 2 AM UTC daily
 */
@Injectable()
export class ProcessNoShowDebtScheduler {
  private readonly logger = new Logger(ProcessNoShowDebtScheduler.name);

  constructor(
    private readonly processNoShowDebtUseCase: ProcessNoShowDebtUseCase,
    @Inject('EventRepository')
    private readonly eventRepository: EventRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleProcessNoShowDebt() {
    this.logger.log('Starting scheduled no-show debt processing...');

    try {
      // Get all completed events
      const completedEvents = await this.eventRepository.findAll({
        status: EventStatus.COMPLETED,
      });

      this.logger.log(
        `Found ${completedEvents.length} completed events to process`,
      );

      // Process each event
      for (const event of completedEvents) {
        try {
          await this.processNoShowDebtUseCase.execute(event.id);
          this.logger.debug(`Processed no-shows for event ${event.id}`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error processing event ${event.id}: ${errorMessage}`,
          );
        }
      }

      this.logger.log('No-show debt processing completed successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error processing no-show debts: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
