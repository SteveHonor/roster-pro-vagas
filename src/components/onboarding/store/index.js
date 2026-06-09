import { defineStore } from 'pinia';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    memberInvited: false,
    vagaCreated:   false,
    dismissed:     false,
    ready:         false
  }),

  actions: {
    setMemberInvited() { this.memberInvited = true; },
    setVagaCreated()   { this.vagaCreated = true; },
    dismiss()          { this.dismissed = true; },
    setReady()         { this.ready = true; }
  },

  persist: {
    pick: ['memberInvited', 'vagaCreated', 'dismissed']
  }
});
