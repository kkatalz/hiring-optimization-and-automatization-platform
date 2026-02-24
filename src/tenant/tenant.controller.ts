import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/createTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { TenantDto } from '../tenant/dto/tenant.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(UserRole.superAdmin)
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
    return await this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.superAdmin)
  async findAll(): Promise<TenantDto[]> {
    return await this.tenantService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.superAdmin)
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TenantDto> {
    return await this.tenantService.findDtoById(id);
  }

  @Patch(':id')
  @Roles(UserRole.superAdmin)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    return await this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.superAdmin)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TenantDto> {
    return await this.tenantService.remove(id);
  }
}
