import { defineStore } from 'pinia';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    // sincronizado com o backend — persiste
    teamCreated:     false,
    memberInvited:   false,
    scheduleCreated: false,
    vagaCreated:     false,
    dismissed:       false,

    // flag de carregamento — NÃO persiste, começa false a cada sessão
    ready: false
  }),

  getters: {
    completedCount: state =>
      1 + [state.teamCreated, state.memberInvited, state.scheduleCreated].filter(Boolean).length,

    totalCount: () => 4,

    allDone: state => state.teamCreated && state.memberInvited && state.scheduleCreated
  },

  actions: {
    setTeamCreated()     { this.teamCreated = true; },
    setMemberInvited()   { this.memberInvited = true; },
    setScheduleCreated() { this.scheduleCreated = true; },
    setVagaCreated()     { this.vagaCreated = true; },
    dismiss()            { this.dismissed = true; },
    setReady()           { this.ready = true; }
  },

  persist: {
    // persiste tudo EXCETO ready
    pick: ['teamCreated', 'memberInvited', 'scheduleCreated', 'vagaCreated', 'dismissed']
  }
});
