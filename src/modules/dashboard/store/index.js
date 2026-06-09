import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    openShifts: 0, // Turnos não preenchidos
    totalHours: 0, // Total de horas trabalhadas
    activeWorkers: 0, // Funcionários ativos
    upcomingShifts: [] // Próximos turnos
  }),

  actions: {
    async loadShifts() {
      try {
        // const response = await axios.get('/api/shifts');
        const shifts = [];

        // Simulação de processamento dos dados
        this.upcomingShifts = shifts;
        this.openShifts = shifts.filter(s => s.status === 'aberto').length;
        this.totalHours = shifts.reduce((sum, s) => sum + s.hours, 0);
        this.activeWorkers = new Set(shifts.map(s => s.worker)).size;
      } catch (error) {
        console.error('Erro ao carregar os turnos:', error);
      }
    }
  }
});
