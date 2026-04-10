import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/createTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant';
import { Not, Repository } from 'typeorm';
import { TenantDto } from '../tenant/dto/tenant.dto';
import { tenantToTenantDto } from '../tenant/map/tenant.map';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantDto> {
    const tenantWithSlug = await this.tenantRepository.findOne({
      where: {
        slug: createTenantDto.slug,
        deleted: false,
      },
    });

    if (tenantWithSlug) {
      throw new HttpException(
        'Tenant with given slug already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenantWithEmail = await this.tenantRepository.findOne({
      where: {
        email: createTenantDto.email,
        deleted: false,
      },
    });

    if (tenantWithEmail) {
      throw new HttpException(
        'Tenant with given email already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newTenant = this.tenantRepository.create(createTenantDto);
    await this.tenantRepository.save(newTenant);

    return tenantToTenantDto(newTenant);
  }

  async findAll(): Promise<TenantDto[]> {
    const tenants = await this.tenantRepository.find({
      where: { deleted: false },
    });

    return tenants.map(tenantToTenantDto);
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    const tenant = await this.findById(id);

    if (updateTenantDto.slug)
      await this.validateSlugUniqueness(updateTenantDto.slug, id);

    if (updateTenantDto.email)
      await this.validateEmailUniqueness(updateTenantDto.email, id);

    if (updateTenantDto.email !== undefined)
      tenant.email = updateTenantDto.email;
    if (updateTenantDto.slug !== undefined) tenant.slug = updateTenantDto.slug;

    const updatedTenant = await this.tenantRepository.save(tenant);

    return tenantToTenantDto(updatedTenant);
  }

  async remove(id: string): Promise<TenantDto> {
    const tenant = await this.findById(id);

    tenant.deleted = true;

    await this.tenantRepository.save(tenant);

    return tenantToTenantDto(tenant);
  }

  async findDtoById(id: string): Promise<TenantDto> {
    const tenant = await this.findById(id);

    return tenantToTenantDto(tenant);
  }

  private async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, deleted: false },
    });
    if (!tenant) {
      throw new HttpException(
        'Tenant with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return tenant;
  }

  private async validateSlugUniqueness(
    slug: string,
    id: string,
  ): Promise<void> {
    const tenantWithGivenSlug = await this.tenantRepository.findOne({
      where: {
        slug,
        deleted: false,
        id: Not(id),
      },
    });
    if (tenantWithGivenSlug) {
      throw new HttpException(
        'Tenant with given slug already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateEmailUniqueness(
    email: string,
    id: string,
  ): Promise<void> {
    const tenantWithGivenEmail = await this.tenantRepository.findOne({
      where: {
        email,
        deleted: false,
        id: Not(id),
      },
    });

    if (tenantWithGivenEmail) {
      throw new HttpException(
        'Tenant with given email already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
