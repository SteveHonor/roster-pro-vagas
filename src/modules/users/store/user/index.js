import { defineStore } from 'pinia';
import { useCompanyStore } from '@/modules/users/store/company';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: '',
      name: '',
      phone: '',
      profile: '',
      owner: false,
      companyId: '',
      managedTeamIds: [],
      adminPermissions: null
    },
    responsibilities: [],
    removed: [],
    users: []
  }),

  getters: {
    getUsers(state) {
      return state.users;
    },
    getUser(state) {
      return state.user;
    },
    getResponsibilities(state) {
      return state.responsibilities;
    },
    getRemoved(state) {
      return state.removed;
    },
    getManagedTeamIds(state) {
      return state.user.managedTeamIds ?? [];
    }
  },

  actions: {
    setUsers(users) {
      this.users = users;
    },
    setUser(user) {
      this.user = {
        ...user,
        managedTeamIds: user.managedTeamIds ?? [],
        adminPermissions: user.adminPermissions ?? null
      };
      this.responsibilities = user.responsibilities;
    },
    setUserCompany(companyId) {
      this.user.companyId = companyId;
    },
    setResponsibility(responsibilities) {
      this.responsibilities = responsibilities;
    },
    removeResponsibility(responsibilityIndex, id) {
      this.removed.push(id);
      this.responsibilities.splice(responsibilityIndex, 1);
    },
    setManagedTeamIds(ids) {
      this.user.managedTeamIds = ids ?? [];
    },

    setAdminPermissions(perms) {
      this.user.adminPermissions = perms;
    },

    resetUser() {
      const companyStore = useCompanyStore();

      this.user = {
        id: '',
        name: '',
        phone: '',
        profile: '',
        owner: false,
        companyId: companyStore.getChosenCompany?.id ?? '',
        managedTeamIds: [],
        adminPermissions: null
      };

      this.responsibilities = [];
      this.removed = [];
    }
  },
  persist: true
});
