<template>
  <div class="flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-slate-800">Agenda</h1>
        <p class="text-xs text-slate-400">Entrevistas e propostas enviadas</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 self-start">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="[
          'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition',
          activeTab === tab.key
            ? 'bg-white shadow-sm text-slate-800'
            : 'text-slate-500 hover:text-slate-700'
        ]"
        @click="activeTab = tab.key"
      >
        <BaseIcon :name="tab.icon" class="!size-4" />
        {{ tab.label }}
        <span
          v-if="tab.count > 0"
          class="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- ── ENTREVISTAS ─────────────────────────────────────── -->
    <div v-if="activeTab === 'interviews'">

      <!-- Filtros -->
      <div class="mb-3 flex items-center gap-2">
        <button
          v-for="f in interviewFilters"
          :key="f.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1 text-xs font-medium transition',
            interviewStatus === f.value
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          ]"
          @click="setInterviewFilter(f.value)"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingInterviews" class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-md bg-slate-100" />
      </div>

      <!-- Lista agrupada -->
      <template v-else-if="groupedInterviews.length">
        <div v-for="group in groupedInterviews" :key="group.label" class="mb-6">
          <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{{ group.label }}</p>
          <div class="space-y-2">
            <div
              v-for="interview in group.items"
              :key="interview.id"
              class="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm"
            >
              <!-- Avatar -->
              <div
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                :style="{ backgroundColor: avatarColor(interview.candidateName) }"
              >
                {{ initials(interview.candidateName) }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-800">{{ interview.candidateName || '—' }}</p>
                <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span>{{ interview.jobTitle }}</span>
                  <span>·</span>
                  <span class="flex items-center gap-1">
                    <BaseIcon name="Calendar" class="!size-3" />
                    {{ formatDateTime(interview.scheduledAt) }}
                  </span>
                  <span>·</span>
                  <span>{{ modalityLabel(interview.modality) }}</span>
                  <span>·</span>
                  <span>{{ interview.durationMinutes }}min</span>
                </div>
              </div>

              <!-- Status chip -->
              <span :class="interviewStatusChip(interview.status).cls" class="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold">
                {{ interviewStatusChip(interview.status).label }}
              </span>

              <!-- Ações -->
              <div v-if="interview.status === 'scheduled'" class="flex flex-shrink-0 items-center gap-1">
                <button
                  type="button"
                  class="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                  @click="updateInterviewStatus(interview, 'completed')"
                >
                  Realizada
                </button>
                <button
                  type="button"
                  class="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
                  @click="updateInterviewStatus(interview, 'no_show')"
                >
                  Não compareceu
                </button>
                <button
                  type="button"
                  class="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  @click="updateInterviewStatus(interview, 'cancelled')"
                >
                  Cancelar
                </button>
              </div>

              <!-- Link da reunião -->
              <a
                v-if="interview.meetingLink && interview.status === 'scheduled'"
                :href="interview.meetingLink"
                target="_blank" rel="noopener"
                class="flex-shrink-0 rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-600 transition hover:bg-blue-100"
              >
                Abrir reunião
              </a>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 py-12 text-center">
        <BaseIcon name="Calendar" class="!size-8 mb-2 text-slate-200" />
        <p class="text-sm text-slate-400">Nenhuma entrevista encontrada</p>
      </div>

      <!-- Modal de notas após entrevista realizada -->
      <div
        v-if="notesModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="notesModal.open = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <p class="mb-3 text-base font-semibold text-slate-800">Notas da entrevista</p>
          <p class="mb-3 text-xs text-slate-500">Adicione observações e uma avaliação opcional.</p>

          <!-- Rating -->
          <div class="mb-3 flex items-center gap-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="text-xl transition"
              :class="notesModal.rating >= star ? 'text-amber-400' : 'text-slate-200'"
              @click="notesModal.rating = star"
            >★</button>
            <span v-if="notesModal.rating" class="ml-2 text-xs text-slate-400">{{ notesModal.rating }}/5</span>
          </div>

          <textarea
            v-model="notesModal.notes"
            rows="4"
            placeholder="Observações sobre o candidato, pontos fortes, pontos de atenção…"
            class="w-full resize-none rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
          />
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
              @click="notesModal.open = false"
            >
              Pular
            </button>
            <button
              type="button"
              class="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              @click="saveNotes"
            >
              Salvar notas
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PROPOSTAS ───────────────────────────────────────── -->
    <div v-if="activeTab === 'offers'">

      <!-- Filtros -->
      <div class="mb-3 flex items-center gap-2 flex-wrap">
        <button
          v-for="f in offerFilters"
          :key="f.value"
          type="button"
          :class="[
            'rounded-full px-3 py-1 text-xs font-medium transition',
            offerStatus === f.value
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          ]"
          @click="setOfferFilter(f.value)"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loadingOffers" class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-md bg-slate-100" />
      </div>

      <!-- Lista -->
      <div v-else-if="offers.length" class="space-y-2">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm"
        >
          <!-- Avatar -->
          <div
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
            :style="{ backgroundColor: avatarColor(offer.candidateName) }"
          >
            {{ initials(offer.candidateName) }}
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">{{ offer.candidateName || '—' }}</p>
            <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>{{ offer.jobTitle }}</span>
              <span>·</span>
              <span class="font-medium text-slate-600">{{ formatSalary(offer.salary) }}</span>
              <template v-if="offer.sentAt">
                <span>·</span>
                <span>Enviada {{ timeAgo(offer.sentAt) }}</span>
              </template>
              <template v-if="offer.respondedAt">
                <span>·</span>
                <span>Respondida {{ timeAgo(offer.respondedAt) }}</span>
              </template>
              <template v-if="offer.expiresAt && offer.status === 'sent'">
                <span>·</span>
                <span class="text-amber-500">Expira {{ formatDate(offer.expiresAt) }}</span>
              </template>
            </div>
          </div>

          <!-- Status chip -->
          <span :class="offerStatusChip(offer.status).cls" class="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold">
            {{ offerStatusChip(offer.status).label }}
          </span>

          <!-- Ação: reenviar -->
          <button
            v-if="offer.status === 'sent'"
            type="button"
            class="flex-shrink-0 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
            :disabled="resendingId === offer.id"
            @click="resendOffer(offer)"
          >
            {{ resendingId === offer.id ? 'Enviando…' : 'Reenviar email' }}
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 py-12 text-center">
        <BaseIcon name="DocumentText" class="!size-8 mb-2 text-slate-200" />
        <p class="text-sm text-slate-400">Nenhuma proposta encontrada</p>
      </div>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import vagasService from '@/services/vagas';
import { formatDateTime, formatDate, formatCurrencyFull, timeAgo } from '@/utils/format';

export default {
  components: { BaseIcon },

  data() {
    return {
      activeTab:        'interviews',
      interviews:       [],
      offers:           [],
      loadingInterviews: true,
      loadingOffers:    true,
      interviewStatus:  'all',
      offerStatus:      'all',
      resendingId:      null,
      notesModal: {
        open:        false,
        interviewId: null,
        notes:       '',
        rating:      0
      }
    };
  },

  computed: {
    tabs() {
      const scheduled = this.interviews.filter(i => i.status === 'scheduled').length;
      const pending   = this.offers.filter(o => o.status === 'sent').length;
      return [
        { key: 'interviews', label: 'Entrevistas', icon: 'Calendar',     count: scheduled },
        { key: 'offers',     label: 'Propostas',   icon: 'DocumentText', count: pending   }
      ];
    },

    interviewFilters() {
      return [
        { value: 'all',       label: 'Todas'          },
        { value: 'scheduled', label: 'Agendadas'      },
        { value: 'completed', label: 'Realizadas'     },
        { value: 'no_show',   label: 'Não compareceu' },
        { value: 'cancelled', label: 'Canceladas'     }
      ];
    },

    offerFilters() {
      return [
        { value: 'all',      label: 'Todas'     },
        { value: 'draft',    label: 'Rascunho'  },
        { value: 'sent',     label: 'Enviadas'  },
        { value: 'accepted', label: 'Aceitas'   },
        { value: 'rejected', label: 'Recusadas' },
        { value: 'expired',  label: 'Expiradas' }
      ];
    },

    filteredInterviews() {
      if (this.interviewStatus === 'all') return this.interviews;
      return this.interviews.filter(i => i.status === this.interviewStatus);
    },

    groupedInterviews() {
      const now   = new Date();
      const today = now.toDateString();
      const groups = { today: [], upcoming: [], past: [] };

      for (const i of this.filteredInterviews) {
        const d = new Date(i.scheduledAt);
        if (d.toDateString() === today)  groups.today.push(i);
        else if (d > now)                groups.upcoming.push(i);
        else                             groups.past.push(i);
      }

      return [
        groups.today.length    && { label: 'Hoje',     items: groups.today    },
        groups.upcoming.length && { label: 'Próximas', items: groups.upcoming },
        groups.past.length     && { label: 'Passadas', items: groups.past     }
      ].filter(Boolean);
    }
  },

  async mounted() {
    await Promise.all([this.loadInterviews(), this.loadOffers()]);
  },

  methods: {
    async loadInterviews() {
      this.loadingInterviews = true;
      try {
        this.interviews = await vagasService.fetchInterviews();
      } finally {
        this.loadingInterviews = false;
      }
    },

    async loadOffers() {
      this.loadingOffers = true;
      try {
        this.offers = await vagasService.fetchOffers();
      } finally {
        this.loadingOffers = false;
      }
    },

    async setInterviewFilter(value) {
      this.interviewStatus = value;
    },

    async setOfferFilter(value) {
      this.offerStatus = value;
      this.loadingOffers = true;
      try {
        const params = value !== 'all' ? { status: value } : {};
        this.offers = await vagasService.fetchOffers(params);
      } finally {
        this.loadingOffers = false;
      }
    },

    async updateInterviewStatus(interview, status) {
      try {
        const updated = await vagasService.updateInterview(interview.id, { status });
        const idx = this.interviews.findIndex(i => i.id === interview.id);
        if (idx !== -1) this.interviews[idx] = updated;
        if (status === 'completed') {
          this.notesModal = { open: true, interviewId: interview.id, notes: '', rating: 0 };
        }
      } catch (e) {
        console.error(e);
      }
    },

    async saveNotes() {
      if (!this.notesModal.interviewId) return;
      try {
        const payload = {};
        if (this.notesModal.notes)  payload.interviewer_notes = this.notesModal.notes;
        if (this.notesModal.rating) payload.rating = this.notesModal.rating;
        const updated = await vagasService.updateInterview(this.notesModal.interviewId, payload);
        const idx = this.interviews.findIndex(i => i.id === updated.id);
        if (idx !== -1) this.interviews[idx] = updated;
      } catch (e) {
        console.error(e);
      } finally {
        this.notesModal.open = false;
      }
    },

    async resendOffer(offer) {
      if (this.resendingId) return;
      this.resendingId = offer.id;
      try {
        await vagasService.resendOffer(offer.id);
      } catch (e) {
        console.error(e);
      } finally {
        this.resendingId = null;
      }
    },

    interviewStatusChip(status) {
      return {
        scheduled: { cls: 'bg-blue-100 text-blue-700',    label: 'Agendada'        },
        completed: { cls: 'bg-emerald-100 text-emerald-700', label: 'Realizada'     },
        no_show:   { cls: 'bg-amber-100 text-amber-700',  label: 'Não compareceu'  },
        cancelled: { cls: 'bg-slate-100 text-slate-500',  label: 'Cancelada'       }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    offerStatusChip(status) {
      return {
        draft:    { cls: 'bg-slate-100 text-slate-500',     label: 'Rascunho'  },
        sent:     { cls: 'bg-blue-100 text-blue-700',       label: 'Enviada'   },
        accepted: { cls: 'bg-emerald-100 text-emerald-700', label: 'Aceita'    },
        rejected: { cls: 'bg-red-100 text-red-600',         label: 'Recusada'  },
        expired:  { cls: 'bg-slate-100 text-slate-400',     label: 'Expirada'  }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityLabel(m) {
      return { video: 'Vídeo', phone: 'Telefone', in_person: 'Presencial' }[m] || m;
    },

    formatDateTime(v) { return formatDateTime(v); },
    formatDate(v)     { return formatDate(v); },
    timeAgo(v)        { return timeAgo(v); },
    formatSalary(v)   { return v ? formatCurrencyFull(v) : '—'; },

    avatarColor(name) {
      const palette = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#10b981','#14b8a6','#3b82f6','#0ea5e9','#a855f7'];
      let hash = 0;
      for (const c of (name || '')) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
      return palette[Math.abs(hash) % palette.length];
    },

    initials(name) {
      return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }
  }
};
</script>
