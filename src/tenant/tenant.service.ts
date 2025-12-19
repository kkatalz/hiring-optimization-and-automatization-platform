import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant';
import { Repository } from 'typeorm';
import { TenantDto } from '../tenant/dto/tenant.dto';
import { tenantToTenantDto } from '../tenant/map/tenant.map';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug, deleted: false },
    });
    if (tenant) {
      throw new HttpException(
        'Tenant with given slug already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newTenant = this.tenantRepository.create(createTenantDto);

    return await this.tenantRepository.save(newTenant);
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

    Object.assign(tenant, updateTenantDto);

    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<Tenant> {
    const tenant = await this.findById(id);

    tenant.deleted = true;

    return await this.tenantRepository.save(tenant);
  }

  async findDtoById(id: string): Promise<TenantDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, deleted: false },
    });
    if (!tenant) {
      throw new HttpException(
        'Tenant with given id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return tenantToTenantDto(tenant);
  }

  private async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, deleted: false },
    });
    if (!tenant) {
      throw new HttpException(
        'Tenant with given id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return tenant;
  }
}
