<template>
  <div v-if="visible" class="relative mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 pr-9 sm:pr-4">
    <button type="button" class="absolute right-2 top-2.5 rounded p-1 text-blue-300 hover:text-blue-500 transition" aria-label="Fechar" @click="dismiss">
      <BaseIcon name="XMark" class="h-4 w-4" />
    </button>

    <!-- Desktop -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pr-6">
      <div class="flex items-center gap-2">
        <BaseIcon name="Squares" class="h-4 w-4 shrink-0 text-blue-500" />
        <p class="text-xs text-blue-800">
          <span class="font-medium">Replicar agendas de {{ previousMonthName }}?</span>
          — Copie todas as agendas do mês anterior para {{ currentMonthName }} com um clique.
        </p>
      </div>
      <button type="button" class="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition" :disabled="loading" @click="clone">
        {{ loading ? 'Replicando...' : 'Replicar' }}
      </button>
    </div>

    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <BaseIcon name="Squares" class="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-blue-900">Replicar agendas de {{ previousMonthName }}?</p>
          <p class="text-xs text-blue-700 leading-relaxed mt-0.5">Copie todas as agendas do mês anterior para {{ currentMonthName }} com um clique.</p>
          <button type="button" class="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition" :disabled="loading" @click="clone">
            {{ loading ? 'Replicando...' : 'Replicar agendas' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const storageKey = () => { const n = new Date(); return `renewal_banner_dismissed_${n.getFullYear()}_${n.getMonth()+1}`; };

export default {
  name: 'MonthlyRenewalBanner',
  components: { BaseIcon },
  emits: ['cloned'],
  data: () => ({ dismissed: false, loading: false, hasPreviousMonth: false }),
  computed: {
    visible() { return !this.dismissed && this.$can?.canAccess('admin') && new Date().getDate() <= 10 && this.hasPreviousMonth; },
    currentMonthName()  { return MONTHS_PT[new Date().getMonth()]; },
    previousMonthName() { const m = new Date().getMonth(); return MONTHS_PT[m === 0 ? 11 : m - 1]; }
  },
  created() { this.dismissed = !!localStorage.getItem(storageKey()); },
  async mounted() {
    if (this.dismissed || new Date().getDate() > 10 || !this.$can?.canAccess('admin')) return;
    try { const { exists } = await this.axios.get('/events/previous_month_exists'); this.hasPreviousMonth = exists; } catch {}
  },
  methods: {
    dismiss() { this.dismissed = true; localStorage.setItem(storageKey(), '1'); },
    async clone() {
      this.loading = true;
      try { const n = new Date(); const r = await this.axios.post('events/clone_month', { year: n.getFullYear(), month: n.getMonth()+1 }); this.$emit('cloned', r.data); this.dismiss(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    }
  }
};
</script>
