import { hasPermission, type Permission } from '@/types/common/permission';
import { useAppSelector } from '@/app/hooks';

export const useHasPermission = () => {
  const role = useAppSelector((state) => state.auth.user?.role);
  return (permission: Permission) => hasPermission(role, permission);
};
