import { Tenant } from '../../entities/tenant';
import { TenantDto } from '../../tenant/dto/tenant.dto';

export const tenantToTenantDto = ({ id, email, slug }: Tenant): TenantDto => ({
  id,
  email,
  slug,
});
