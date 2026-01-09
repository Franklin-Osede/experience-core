import { Entity } from '../../../shared/domain/entity.base';
import { Money } from '../../../shared/domain/money.vo';
import { ServiceCategory } from './service-category.enum';
import { v4 as uuidv4 } from 'uuid';

export interface ServiceListingProps {
  providerId: string; // The user with role PROVIDER
  title: string; // e.g. "Pioneer CDJ-3000 Nexus Set"
  description: string;
  category: ServiceCategory;
  pricePerDay: Money;
  specs?: Record<string, any>; // Flexible specs (wattage, dimensions)
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceListing extends Entity<ServiceListingProps> {
  private constructor(id: string, props: ServiceListingProps) {
    super(id, props);
  }

  static create(
    props: Omit<
      ServiceListingProps,
      'id' | 'createdAt' | 'updatedAt' | 'isAvailable'
    >,
  ): ServiceListing {
    const now = new Date();
    return new ServiceListing(uuidv4(), {
      ...props,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public updatePrice(newPrice: Money): void {
    this.props.pricePerDay = newPrice;
    this.props.updatedAt = new Date();
  }

  public markUnavailable(): void {
    this.props.isAvailable = false;
    this.props.updatedAt = new Date();
  }

  public markAvailable(): void {
    this.props.isAvailable = true;
    this.props.updatedAt = new Date();
  }

  // Getters for accessing properties
  get title(): string {
    return this.props.title;
  }

  get category(): ServiceCategory {
    return this.props.category;
  }

  get isAvailable(): boolean {
    return this.props.isAvailable;
  }

  get pricePerDay(): Money {
    return this.props.pricePerDay;
  }

  get specs(): Record<string, any> | undefined {
    return this.props.specs;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * Reconstructs a ServiceListing entity from persistence data
   */
  static fromPersistence(
    props: ServiceListingProps & { id: string },
  ): ServiceListing {
    return new ServiceListing(props.id, {
      providerId: props.providerId,
      title: props.title,
      description: props.description,
      category: props.category,
      pricePerDay: props.pricePerDay,
      specs: props.specs,
      isAvailable: props.isAvailable,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
