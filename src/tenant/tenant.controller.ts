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
import { Tenant } from '../entities/tenant';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/role.enum';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(UserRole.superAdmin)
  create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.superAdmin)
  findAll(): Promise<TenantDto[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.superAdmin)
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<TenantDto> {
    return this.tenantService.findDtoById(id);
  }

  @Patch(':id')
  @Roles(UserRole.superAdmin)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.superAdmin)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Tenant> {
    return this.tenantService.remove(id);
  }
}
