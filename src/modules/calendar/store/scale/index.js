import { defineStore } from 'pinia';

export const useScaleStore = defineStore('scale', {
  state: () => ({
    teams: [],
    positions: {},
    scales: {},
    reports: [],
    schedules: [],

    current: {
      hour: null,
      team: null,
      position: null
    },

    totalsHighlights: {
      month: false,
      event: false
    },

    sendScales: false,
    feedback: {}
  }),

  actions: {
    setFeedback(user) {
      this.feedback = user;
    },

    setReports(reports) {
      this.reports = reports;
    },

    setHour(hour) {
      this.current.hour = hour;
    },

    setTeam(team) {
      this.current.team = team;
    },

    setCurrentPosition(position) {
      this.current.position = position;
    },

    setPositions(positions) {
      const teamId = this.current.team?.id;
      const hourId = this.current.hour?.id;
      if (!teamId || !hourId) return;

      if (!this.positions[teamId]) {
        this.positions[teamId] = {};
      }

      this.positions[teamId][hourId] = positions.map(p => ({
        ...p,
        status: 'active'
      }));
    },

    setScale(user, teamOverride = null) {
      const teamId = teamOverride || this.current.team?.id;
      const hourId = this.current.hour?.id;
      const positionId = this.current.position?.id;

      if (!teamId || !hourId || !positionId) return;

      this.scales[teamId] ??= {};
      this.scales[teamId][hourId] ??= {};
      this.scales[teamId][hourId][positionId] ??= [];

      this.scales[teamId][hourId][positionId].push(user);
      this.sendScales = true;
    },

    removeScale(user) {
      const teamId = this.current.team?.id;
      const hourId = this.current.hour?.id;
      const positionId = this.current.position?.id;

      if (!teamId || !hourId || !positionId) return;

      const list = this.scales?.[teamId]?.[hourId]?.[positionId];

      if (list) {
        const index = list.findIndex(u => u.id === user.id);

        if (index !== -1) list.splice(index, 1);

        if (!list.length) {
          delete this.scales[teamId][hourId][positionId];
        }
      }

      if (this.schedules.length) {
        const idx = this.schedules.findIndex(u => u.user?.id === user.id);
        if (idx !== -1) this.schedules.splice(idx, 1);
      }

      if (this.current.position?.users.length) {
        const currentUser = this.current.position?.users.find(
          u => u.id === user.id
        );
        if (currentUser) currentUser.blockScale = null;
      }
    },

    setPositionActive() {
      if (this.current.position) {
        this.current.position.status = 'active';
      }
    },

    setPositionDone() {
      if (this.current.position) {
        this.current.position.status = 'done';
      }
    },

    getScaleBuilded(hourId = null) {
      return Object.entries(this.scales).flatMap(([teamId, hours]) =>
        Object.entries(hours)
          .filter(([hId]) => !hourId || hId === hourId)
          .flatMap(([hId, positions]) =>
            Object.entries(positions).map(([positionId, users]) => ({
              team_id: teamId,
              hour_id: hId,
              position_id: positionId,
              user_ids: users.map(u => u.id)
            }))
          )
      );
    },

    clearHourScales(hourId) {
      Object.keys(this.scales).forEach(teamId => {
        if (this.scales[teamId]?.[hourId]) {
          delete this.scales[teamId][hourId];
        }
      });
      this.sendScales = Object.values(this.scales).some(teams =>
        Object.values(teams).some(positions =>
          Object.values(positions).some(users => users.length > 0)
        )
      );
    },

    async fetchAllPositions(axios, eventDayId) {
      const hourId = this.current.hour?.id;
      if (!hourId || !this.teams.length) return;

      const teamsNeedingData = this.teams.filter(
        t => !this.positions?.[t.id]?.[hourId]?.length
      );

      await Promise.all(
        teamsNeedingData.map(async team => {
          const data = await axios.get(
            `/event_day/${eventDayId}/team/${team.id}/positions`
          );
          if (data?.length) {
            if (!this.positions[team.id]) this.positions[team.id] = {};
            this.positions[team.id][hourId] = data.map(p => ({ ...p, status: 'active' }));
          }
        })
      );
    },

    clearData() {
      this.scales = {};
      this.positions = {};
      this.schedules = [];
      this.teams = [];
      this.sendScales = false;
      this.current.hour = null;
      // Preserva current.team e current.position (preferência do usuário)
    },

    clearScale() {
      this.scales = {};
      this.positions = {};
      this.teams = [];
      this.sendScales = false;
      this.current.position = null;
    },

    removeUserFromPosition(userId) {
      if (!this.current.position) return;
      this.current.position.users = this.current.position.users.filter(
        u => u.id !== userId
      );
    },

    restoreUserToPosition(user) {
      if (!this.current.position) return;
      if (!this.current.position.users.some(u => u.id === user.id)) {
        this.current.position.users = [...this.current.position.users, user];
      }
    },

    async fetchSchedules(axios, eventId, hourId) {
      if (!eventId || !hourId) return;
      this.schedules = [];
      const data = await axios.get(`/schedule_items/${eventId}/schedules/${hourId}`);
      this.schedules = Array.isArray(data) ? data : [];
    },

    resetCurrent() {
      this.current = { hour: null, team: null, position: null };
    }
  },

  getters: {
    getTabPositions: state => {
      const teamId = state.current.team?.id;
      const hourId = state.current.hour?.id;
      return state.positions?.[teamId]?.[hourId] || [];
    },

    getScales: state => {
      const teamId = state.current.team?.id;
      const hourId = state.current.hour?.id;
      const positionId = state.current.position?.id;
      return state.scales?.[teamId]?.[hourId]?.[positionId] || [];
    },

    getPositionsForTeam: state => teamId => {
      const hourId = state.current.hour?.id;
      return state.positions?.[teamId]?.[hourId] || [];
    },

    getSchedulesForPosition: state => (teamId, positionId) => {
      const hourId = state.current.hour?.id;
      const map = new Map();

      const local = state.scales?.[teamId]?.[hourId]?.[positionId] || [];
      local.forEach(user =>
        map.set(user.id, {
          id: user.id,
          name: user.name,
          averageRating: user.averageRating || 0,
          totals: user.totals
        })
      );

      const schedules = Array.isArray(state.schedules) ? state.schedules : [];
      schedules
        .filter(s => s.position?.id === positionId && s.user)
        .forEach(s =>
          map.set(s.user.id, {
            id: s.user.id,
            name: s.user.name,
            averageRating: s.user.averageRating || 0,
            totals: s.user.totals,
            status: s.status,
            refuseFlag: s.refuseFlag,
            declineReason: s.declineReason,
            blockId: s.blockId,
            scheduleItemId: s.id
          })
        );

      return [...map.values()];
    }
  },

  persist: {
    paths: ['scales', 'positions', 'sendScales', 'totalsHighlights', 'current']
  }
});
