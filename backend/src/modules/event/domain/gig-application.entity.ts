import { Entity } from '../../../shared/domain/entity.base';
import { v4 as uuidv4 } from 'uuid';

export enum GigApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface GigApplicationProps {
  availabilityId: string;
  djId: string;
  proposal: string; // e.g. "Deep House Night with 2 guest DJs"
  status: GigApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class GigApplication extends Entity<GigApplicationProps> {
  private constructor(id: string, props: GigApplicationProps) {
    super(id, props);
  }

  static create(
    props: Omit<
      GigApplicationProps,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): GigApplication {
    const now = new Date();
    return new GigApplication(uuidv4(), {
      ...props,
      status: GigApplicationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public accept(): void {
    this.props.status = GigApplicationStatus.ACCEPTED;
    this.props.updatedAt = new Date();
  }

  public reject(): void {
    this.props.status = GigApplicationStatus.REJECTED;
    this.props.updatedAt = new Date();
  }

  // Getters
  get status(): GigApplicationStatus {
    return this.props.status;
  }

  get availabilityId(): string {
    return this.props.availabilityId;
  }

  get djId(): string {
    return this.props.djId;
  }

  get proposal(): string {
    return this.props.proposal;
  }

  /**
   * Reconstructs a GigApplication entity from persistence data.
   */
  static fromPersistence(
    props: GigApplicationProps & { id: string },
  ): GigApplication {
    return new GigApplication(props.id, props);
  }
}
