<template>
  <Card class="mx-auto">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <button
          class="mb-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600"
          @click="$router.back()"
        >
          <BaseIcon name="ChevronLeft" class="!size-3.5" />
          Voltar
        </button>
        <h1 class="text-lg font-semibold text-slate-900">Pagamentos</h1>
        <p v-if="eventDay" class="mt-0.5 text-sm text-slate-500">
          {{ eventDay.event?.name }} · {{ formatDate(eventDay.date) }}
        </p>
      </div>
      <button
        v-if="pendingItems.length"
        class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        :disabled="saving"
        @click="batchPay"
      >
        <BaseIcon name="Check" class="!size-4" />
        Pagar todos pendentes ({{ pendingItems.length }})
      </button>
    </div>

    <!-- Resumo -->
    <div class="mb-6 grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <p class="text-xs font-medium text-slate-500">Total a pagar</p>
        <p class="mt-1 text-xl font-bold text-slate-900">{{ formatCents(totalCents) }}</p>
      </div>
      <div class="rounded-xl border border-green-100 bg-green-50 p-4">
        <p class="text-xs font-medium text-green-600">Já pago</p>
        <p class="mt-1 text-xl font-bold text-green-700">{{ formatCents(paidCents) }}</p>
      </div>
      <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p class="text-xs font-medium text-amber-600">Pendente</p>
        <p class="mt-1 text-xl font-bold text-amber-700">{{ formatCents(pendingCents) }}</p>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="items.length" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th class="px-4 py-3">Colaborador</th>
            <th class="px-4 py-3">Turno</th>
            <th class="px-4 py-3">Valor (R$)</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-slate-100 last:border-0"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{{ item.user?.name }}</p>
              <p class="text-xs text-slate-400">{{ item.position?.name }}</p>
            </td>
            <td class="px-4 py-3 text-slate-600">
              {{ item.startTime }}–{{ item.endTime }}
            </td>
            <td class="px-4 py-3">
              <input
                v-if="item.payment_status === 'unpaid'"
                type="text"
                inputmode="decimal"
                :value="centsToReal(item._rateOverride ?? item.effective_rate_cents)"
                class="w-28 rounded border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                placeholder="0,00"
                @change="e => item._rateOverride = realToCents(e.target.value)"
                @blur="e => e.target.value = centsToReal(item._rateOverride ?? item.effective_rate_cents)"
              />
              <span v-else class="font-medium text-slate-800">
                {{ formatCents(item.effective_rate_cents) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                v-if="item.payment_status === 'paid'"
                class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700"
              >
                <BaseIcon name="Check" class="!size-3" />
                Pago · {{ formatDateTime(item.paid_at) }}
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
              >
                <BaseIcon name="Clock" class="!size-3" />
                Pendente
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="item.payment_status === 'unpaid'"
                class="rounded border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-600 hover:text-white"
                :disabled="saving"
                @click="payItem(item)"
              >
                Pagar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Empty
      v-else
      title="Nenhum colaborador aceito"
      description="Pagamentos aparecem quando colaboradores aceitam a escala."
    />
  </Card>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';
import Card from '@/components/card/Card';

export default {
  components: { BaseIcon, Empty, Card },

  data() {
    return {
      items: [],
      eventDay: null,
      saving: false
    };
  },

  computed: {
    pendingItems() {
      return this.items.filter(i => i.payment_status === 'unpaid');
    },
    paidItems() {
      return this.items.filter(i => i.payment_status === 'paid');
    },
    totalCents() {
      return this.items.reduce((sum, i) => sum + (i.effective_rate_cents || 0), 0);
    },
    paidCents() {
      return this.paidItems.reduce((sum, i) => sum + (i.effective_rate_cents || 0), 0);
    },
    pendingCents() {
      return this.pendingItems.reduce((sum, i) => sum + (i.effective_rate_cents || 0), 0);
    }
  },

  async mounted() {
    await this.load();
  },

  methods: {
    async load() {
      const eventDayId = this.$route.params.eventDayId;
      const res = await this.axios.get(`events/${eventDayId}`);
      this.eventDay = res;

      await this.axios.get(
        `schedule_items/${eventDayId}/schedules/${this.$route.params.hourId || 'all'}`
      );

      // Busca todos os schedule_items aceitos de todas as horas deste event_day
      const allItems = [];
      for (const hour of res.eventHours || []) {
        const schedRes = await this.axios.get(
          `schedule_items/${eventDayId}/schedules/${hour.id}`
        );
        const accepted = (schedRes || []).flatMap(s =>
          (s.schedule_items || [])
            .filter(i => i.status === 'accepted')
            .map(i => ({ ...i, startTime: hour.startTime, endTime: hour.endTime }))
        );
        allItems.push(...accepted);
      }
      this.items = allItems;
    },

    async payItem(item) {
      this.saving = true;
      try {
        const rate = item._rateOverride || item.effective_rate_cents;
        const updated = await this.axios.patch(`schedule_items/${item.id}/pay`, {
          payment_rate_cents: rate
        });
        const idx = this.items.findIndex(i => i.id === item.id);
        if (idx !== -1) this.items.splice(idx, 1, { ...item, ...updated });
      } finally {
        this.saving = false;
      }
    },

    async batchPay() {
      this.saving = true;
      try {
        const ids = this.pendingItems.map(i => i.id);
        await this.axios.patch('schedule_items/batch_pay', { ids });
        this.items = this.items.map(i =>
          i.payment_status === 'unpaid'
            ? { ...i, payment_status: 'paid', paid_at: new Date().toISOString() }
            : i
        );
      } finally {
        this.saving = false;
      }
    },

    centsToReal(cents) {
      if (!cents && cents !== 0) return '';
      return (cents / 100).toFixed(2).replace('.', ',');
    },
    realToCents(str) {
      if (!str) return null;
      const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
      const val = parseFloat(cleaned);
      return isNaN(val) ? null : Math.round(val * 100);
    },
    formatCents(cents) {
      if (!cents) return 'R$ 0,00';
      return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    },

    formatDate(date) {
      return this.moment(date).format('DD/MM/YYYY');
    },

    formatDateTime(dt) {
      if (!dt) return '';
      return this.moment(dt).format('DD/MM HH:mm');
    }
  }
};
</script>
