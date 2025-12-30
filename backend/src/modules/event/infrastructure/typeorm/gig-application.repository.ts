import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GigApplication } from '../../domain/gig-application.entity';
import { GigApplicationRepository } from '../../domain/gig-application.repository';
import { GigApplicationEntity } from './gig-application.entity';

@Injectable()
export class TypeOrmGigApplicationRepository
  implements GigApplicationRepository
{
  constructor(
    @InjectRepository(GigApplicationEntity)
    private readonly typeOrmRepository: Repository<GigApplicationEntity>,
  ) {}

  async save(application: GigApplication): Promise<void> {
    const entity = this.toEntity(application);
    await this.typeOrmRepository.save(entity);
  }

  async findById(id: string): Promise<GigApplication | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByAvailabilityId(
    availabilityId: string,
  ): Promise<GigApplication[]> {
    const entities = await this.typeOrmRepository.find({
      where: { availabilityId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<GigApplication[]> {
    const entities = await this.typeOrmRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  private toEntity(application: GigApplication): GigApplicationEntity {
    const props = (application as any).props;
    const entity = new GigApplicationEntity();
    entity.id = application.id;
    entity.availabilityId = props.availabilityId;
    entity.djId = props.djId;
    entity.proposal = props.proposal;
    entity.status = props.status;
    entity.createdAt = props.createdAt;
    entity.updatedAt = props.updatedAt;
    return entity;
  }

  private toDomain(entity: GigApplicationEntity): GigApplication {
    return GigApplication.fromPersistence({
      id: entity.id,
      availabilityId: entity.availabilityId,
      djId: entity.djId,
      proposal: entity.proposal,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

