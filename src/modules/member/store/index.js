import { defineStore } from 'pinia';

export const useMemberStore = defineStore('member', {
  state: () => ({
    pendingCount: 0,
    stats: null,
    upcomingSchedules: []
  }),

  actions: {
    async fetchPendingCount(axios, userId) {
      if (!userId) return;
      try {
        const data = await axios.get(`/users/${userId}/pending_count`);
        this.pendingCount = data.count ?? 0;
      } catch {
        // silently ignore
      }
    },

    async fetchHome(axios, userId) {
      if (!userId) return;
      const [schedulesRes] = await Promise.allSettled([
        axios.get(`/users/${userId}/schedules`)
      ]);
      if (schedulesRes.status === 'fulfilled') {
        this.upcomingSchedules = schedulesRes.value || [];
      }
    }
  }
});
