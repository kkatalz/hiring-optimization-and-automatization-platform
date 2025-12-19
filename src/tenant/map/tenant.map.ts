import { Tenant } from 'src/entities/tenant';
import { TenantDto } from 'src/tenant/dto/tenant.dto';

export const tenantToTenantDto = ({ id, email, slug }: Tenant): TenantDto => ({
  id,
  email,
  slug,
});
