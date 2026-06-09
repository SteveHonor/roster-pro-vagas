import { usePlanStore } from '@/components/plan/store';
import { useAuthStore } from '@/modules/auth/store';

export function can() {
  const plan = usePlanStore();
  const auth = useAuthStore();

  function limits() {
    return plan.limits || {};
  }

  function permissions() {
    return plan.permissions || {};
  }

  function features() {
    return plan.features || {};
  }

  function canAccess(role) {
    const permissions = {
      user: auth.isUserPrivilege,
      admin: auth.isAdminPrivilege,
      operator: auth.isOperatorPrivilege
    };

    return Boolean(permissions[role]);
  }

  /**
   * Pode visualizar um recurso?
   * Ex: canView('dashboard')
   */
  function canView(resource) {
    if (features().hasOwnProperty(resource)) {
      return features()[resource] === true;
    }

    return true;
  }

  /**
   * Pode criar?
   * Ex: canCreate('users')
   */
  function canCreate(resource) {
    const limit = limits()[resource];
    if (!limit) return false;
    return limit.canCreate === true;
  }

  /**
   * Pode editar?
   * Ex: canUpdate('teams')
   */
  function canUpdate(resource) {
    const perm = permissions()[resource];
    if (!perm) return false;
    return perm.update === true;
  }

  /**
   * Pode excluir?
   * Ex: canDelete('users')
   */
  function canDelete(resource) {
    const perm = permissions()[resource];
    if (!perm) return false;
    return perm.delete === true;
  }

  /**
   * Info do limite (UI)
   */
  function limitInfo(resource) {
    return limits()[resource] || null;
  }

  /**
   * Admin tem esta permissão granular?
   * Owner sempre retorna true; admin não-owner verifica admin_permissions
   * Ex: canManage('billing')
   */
  function canManage(permission) {
    if (!auth.isAdminPrivilege) return false;
    if (auth.me?.owner) return true;
    const perms = auth.me?.adminPermissions;
    if (!perms) return false;
    return perms[permission] === true;
  }

  return {
    canAccess,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    limitInfo,
    canManage
  };
}
