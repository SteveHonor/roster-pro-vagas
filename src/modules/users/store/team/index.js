import { defineStore } from 'pinia';
import { useCompanyStore } from '@/modules/users/store/company';

export const useTeamStore = defineStore('team', {
  state: () => ({
    team: {
      id: '',
      name: '',
      companyId: '',
      positions: [],
      removed: []
    },
    teams: []
  }),

  getters: {
    getTeams(state) {
      return state.teams;
    },
    getTeam(state) {
      return state.team;
    }
  },

  actions: {
    setTeams(teams) {
      this.teams = teams;
    },
    setTeam(updatedFields) {
      this.team = { ...this.team, ...updatedFields };
    },
    setPosition(position) {
      this.team.positions.push(position);
    },
    removePosition(index, id) {
      this.team.removed.push(id);
      this.team.positions.splice(index, 1);
    },

    resetTeam() {
      const companyStore = useCompanyStore();

      this.team = {
        id: '',
        name: '',
        companyId: companyStore.getChosenCompany?.id ?? '',
        positions: [],
        removed: []
      };
    }
  }
});
