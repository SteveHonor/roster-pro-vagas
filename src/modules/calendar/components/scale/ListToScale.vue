<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ scaleStore.current.position.name }} — Disponíveis
        </span>
        <p class="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
          <BaseIcon name="CursorArrowRays" class="!size-3.5" />
          Clique na linha para adicionar à escala
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="canUseSuggestions && scheduleItemId"
          type="button"
          class="flex items-center gap-1 rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600 hover:bg-violet-100 disabled:opacity-50"
          :disabled="loadingSuggestions"
          @click="loadSuggestions"
        >
          <BaseIcon name="Sparkles" class="!size-3" />
          {{ loadingSuggestions ? 'Carregando...' : 'Sugestões IA' }}
        </button>
        <span class="text-[11px] text-slate-400">{{ filteredUsers.length }} disponíveis</span>
      </div>
    </div>

    <!-- Sugestões IA -->
    <div v-if="suggestions.length" class="rounded-md border border-violet-100 bg-violet-50 p-3">
      <p class="mb-2 flex items-center gap-1 text-[11px] font-semibold text-violet-600">
        <BaseIcon name="Sparkles" class="!size-3" />
        Sugeridos pela IA
      </p>
      <ul class="flex flex-col gap-1.5">
        <li
          v-for="(s, index) in suggestions"
          :key="s.id"
          class="group flex items-center gap-3 rounded-md border border-violet-100 bg-white px-3 py-2 transition-colors"
          :class="isUserAvailable(s.id) ? 'cursor-pointer hover:border-violet-300 hover:bg-violet-50' : 'cursor-default opacity-60'"
          @click="isUserAvailable(s.id) && selectUserById(s.id)"
        >
          <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
            {{ index + 1 }}
          </span>
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ s.name }}</span>
            <div class="flex items-center gap-2 text-[10px] text-slate-400">
              <span>★ {{ s.average_rating }}</span>
              <span>{{ s.acceptance_rate }}% aceite</span>
            </div>
          </div>
          <div
            v-if="isUserAvailable(s.id)"
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-violet-300 transition-all group-hover:bg-violet-600 group-hover:text-white"
          >
            <BaseIcon name="Plus" class="!size-3.5" />
          </div>
          <span v-else class="text-[11px] text-slate-400">Indisponível</span>
        </li>
      </ul>
    </div>

    <div v-if="filteredUsers.length" class="space-y-3">
      <FormInput
        v-model="searchQueries[scaleStore.current.position.name]"
        icon="search"
        placeholder="Pesquisar colaborador"
      />

      <ul class="flex flex-col gap-2">
        <li
          v-for="user in filteredUsers"
          :key="user.id"
          class="group flex items-center gap-3 rounded-md border bg-white px-3 py-2.5 shadow-sm transition-colors"
          :class="[
            isSuggested(user.id) ? 'border-violet-200' : 'border-slate-200',
            !user.blockScale ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50' : 'cursor-default'
          ]"
          @click="!user.blockScale && selectUser(user)"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ user.name }}</span>
              <span
                v-if="isSuggested(user.id)"
                class="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-600"
              >IA</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <RatingStars :rating="parseFloat(user.averageRating) || 0" :background="false" mode="numeric" />
              <span
                v-if="user.totals?.month > 0"
                class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                :title="`Escalado ${user.totals.month}× neste mês (escalas aceitas)`"
              >
                {{ user.totals.month }}× este mês
              </span>
              <span
                v-if="user.totals?.event > 0"
                class="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600"
                :title="`Já tem ${user.totals.event} escala(s) aceita(s) neste evento (todos os dias e horários)`"
              >
                {{ user.totals.event }}× neste evento
              </span>
            </div>
          </div>

          <div class="flex-shrink-0">
            <span
              v-if="user?.blockScale === 'absence'"
              class="flex items-center gap-1 rounded border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-400"
            >
              <BaseIcon name="XMark" class="!size-3.5" />
              Agenda bloqueada
            </span>
            <span
              v-else-if="user?.blockScale === 'schedule'"
              class="flex items-center gap-1 rounded border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-400"
            >
              <BaseIcon name="Check" class="!size-3.5" />
              Já escalado
            </span>
            <div
              v-else
              class="flex h-6 w-6 items-center justify-center rounded-full transition-all group-hover:bg-slate-900 group-hover:text-white"
              :class="isSuggested(user.id) ? 'text-violet-300' : 'text-slate-300'"
            >
              <BaseIcon name="Plus" class="!size-3.5" />
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 py-8">
      <span class="text-xs text-slate-400">Nenhum colaborador disponível</span>
    </div>
  </section>
</template>

<script>
import FormInput from '@/components/form/Input';
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';

import { useScaleStore } from '@/modules/calendar/store/scale';
import { can } from '@/helper/can';

export default {
  name: 'ListToScale',
  components: {
    FormInput,
    BaseIcon,
    RatingStars
  },
  props: {
    schedules: {
      type: Object,
      required: true
    },
    scheduleItemId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['user-scaled', 'all-scaled'],
  data() {
    return {
      searchQueries: {},
      suggestions: [],
      loadingSuggestions: false
    };
  },
  computed: {
    scaleStore: () => useScaleStore(),
    canUseSuggestions() {
      return can().canView('scheduleSuggestions');
    },
    suggestedIds() {
      return new Set(this.suggestions.map(s => s.id));
    },
    filteredUsers() {
      const query = this.searchQueries[this.scaleStore.current.position?.name] || '';
      let users = [];

      if (this.schedules.schedules.length) {
        const scaledIds = this.schedules.schedules.map(s => s.id);
        users = this.scaleStore.current.position.users.filter(u => !scaledIds.includes(u.id));
      } else {
        users = this.scaleStore.current.position.users;
      }

      if (query) {
        users = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
      }

      return users;
    }
  },
  methods: {
    isSuggested(userId) {
      return this.suggestedIds.has(userId);
    },
    isUserAvailable(userId) {
      return this.filteredUsers.some(u => u.id === userId && !u.blockScale);
    },
    async loadSuggestions() {
      if (!this.scheduleItemId) return;
      this.loadingSuggestions = true;
      try {
        this.suggestions = await this.axios.get('/schedule_items/suggestions', {
          params: { schedule_item_id: this.scheduleItemId }
        });
      } catch {
        this.suggestions = [];
      } finally {
        this.loadingSuggestions = false;
      }
    },
    selectUser(user) {
      this.searchQueries[this.scaleStore.current.position.name] = '';
      this.suggestions = this.suggestions.filter(s => s.id !== user.id);
      this.scaleStore.setScale(user);
      this.scaleStore.removeUserFromPosition(user.id);
      if (this.filteredUsers.length === 0) this.$emit('all-scaled');
    },
    selectUserById(userId) {
      const user = this.scaleStore.current.position.users.find(u => u.id === userId);
      if (user) this.selectUser(user);
    }
  }
};
</script>
