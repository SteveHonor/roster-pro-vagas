<template>
  <Tab :tabs="tabs" :min-hight="false">
    <template #tabs="{ activeTab }">

      <!-- ── ENTREVISTAS ─────────────────────────────────── -->
      <template v-if="activeTab === 'interviews'">
        <FilterPills
          v-model="interviewStatus"
          :options="interviewFilters"
          class="mb-4"
        />

        <SkeletonRows v-if="loadingInterviews" :rows="4" has-avatar has-trailing />

        <template v-else-if="groupedInterviews.length">
          <div v-for="group in groupedInterviews" :key="group.label" class="mb-6">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {{ group.label }}
            </p>
            <div class="space-y-2">
              <CardRow v-for="interview in group.items" :key="interview.id">
                <template #prefix>
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    :style="{ backgroundColor: avatarColor(interview.candidateName) }"
                  >
                    {{ initials(interview.candidateName) }}
                  </div>
                </template>

                <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span class="text-sm font-medium text-slate-800">{{ interview.candidateName || '—' }}</span>
                  <span>·</span>
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

                <template #trailing>
                  <div class="flex items-center gap-2">
                    <span
                      :class="interviewStatusChip(interview.status).cls"
                      class="rounded px-2 py-0.5 text-[10px] font-bold"
                    >
                      {{ interviewStatusChip(interview.status).label }}
                    </span>

                    <template v-if="interview.status === 'scheduled'">
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
                    </template>

                    <a
                      v-if="interview.meetingLink && interview.status === 'scheduled'"
                      :href="interview.meetingLink"
                      target="_blank"
                      rel="noopener"
                      class="rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      Abrir reunião
                    </a>
                  </div>
                </template>
              </CardRow>
            </div>
          </div>
        </template>

        <Empty v-else title="Nenhuma entrevista encontrada" icon="Calendar" wrapper-class="min-h-[20vh]" />
      </template>

      <!-- ── PROPOSTAS ──────────────────────────────────── -->
      <template v-if="activeTab === 'offers'">
        <FilterPills
          v-model="offerStatus"
          :options="offerFilters"
          class="mb-4"
          @update:model-value="setOfferFilter"
        />

        <SkeletonRows v-if="loadingOffers" :rows="4" has-avatar has-trailing />

        <div v-else-if="offers.length" class="space-y-2">
          <CardRow v-for="offer in offers" :key="offer.id">
            <template #prefix>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-bold text-white"
                :style="{ backgroundColor: avatarColor(offer.candidateName) }"
              >
                {{ initials(offer.candidateName) }}
              </div>
            </template>

            <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span class="text-sm font-medium text-slate-800">{{ offer.candidateName || '—' }}</span>
              <span>·</span>
              <span>{{ offer.jobTitle }}</span>
              <span>·</span>
              <span class="font-medium text-slate-600">{{ formatSalary(offer.salary) }}</span>
              <template v-if="offer.sentAt">
                <span>·</span>
                <span>Enviada {{ timeAgo(offer.sentAt) }}</span>
              </template>
              <template v-if="offer.expiresAt && offer.status === 'sent'">
                <span>·</span>
                <span class="text-amber-500">Expira {{ formatDate(offer.expiresAt) }}</span>
              </template>
            </div>

            <template #trailing>
              <div class="flex items-center gap-2">
                <span
                  :class="offerStatusChip(offer.status).cls"
                  class="rounded px-2 py-0.5 text-[10px] font-bold"
                >
                  {{ offerStatusChip(offer.status).label }}
                </span>
                <button
                  v-if="offer.status === 'sent'"
                  type="button"
                  class="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  :disabled="resendingId === offer.id"
                  @click="resendOffer(offer)"
                >
                  {{ resendingId === offer.id ? 'Enviando…' : 'Reenviar email' }}
                </button>
              </div>
            </template>
          </CardRow>
        </div>

        <Empty v-else title="Nenhuma proposta encontrada" icon="DocumentText" wrapper-class="min-h-[20vh]" />
      </template>

    </template>
  </Tab>

  <!-- Modal de notas pós-entrevista -->
  <div
    v-if="notesModal.open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    @click.self="notesModal.open = false"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <p class="mb-3 text-base font-semibold text-slate-800">Notas da entrevista</p>
      <p class="mb-3 text-xs text-slate-500">Adicione observações e uma avaliação opcional.</p>

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
</template>

<script>
import Tab from '@/components/tab/Tab';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import BaseIcon from '@/components/icons/BaseIcon';
import FilterPills from '@/components/filter/FilterPills';
import vagasService from '@/services/vagas';
import { formatDateTime, formatDate, formatCurrencyFull, timeAgo } from '@/utils/format';

export default {
  components: { Tab, CardRow, Empty, SkeletonRows, BaseIcon, FilterPills },

  data() {
    return {
      interviews:        [],
      offers:            [],
      loadingInterviews: true,
      loadingOffers:     true,
      interviewStatus:   'all',
      offerStatus:       'all',
      resendingId:       null,
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
        { key: 'interviews', name: 'Entrevistas', icon: 'Calendar',     badge: scheduled || undefined },
        { key: 'offers',     name: 'Propostas',   icon: 'DocumentText', badge: pending   || undefined }
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
      const now    = new Date();
      const today  = now.toDateString();
      const groups = { today: [], upcoming: [], past: [] };

      for (const i of this.filteredInterviews) {
        const d = new Date(i.scheduledAt);
        if (d.toDateString() === today) groups.today.push(i);
        else if (d > now)               groups.upcoming.push(i);
        else                            groups.past.push(i);
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
      try { this.interviews = await vagasService.fetchInterviews(); }
      finally { this.loadingInterviews = false; }
    },

    async loadOffers() {
      this.loadingOffers = true;
      try { this.offers = await vagasService.fetchOffers(); }
      finally { this.loadingOffers = false; }
    },

    async setOfferFilter(value) {
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
        scheduled: { cls: 'bg-blue-100 text-blue-700',       label: 'Agendada'       },
        completed: { cls: 'bg-emerald-100 text-emerald-700', label: 'Realizada'      },
        no_show:   { cls: 'bg-amber-100 text-amber-700',     label: 'Não compareceu' },
        cancelled: { cls: 'bg-slate-100 text-slate-500',     label: 'Cancelada'      }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    offerStatusChip(status) {
      return {
        draft:    { cls: 'bg-slate-100 text-slate-500',     label: 'Rascunho' },
        sent:     { cls: 'bg-blue-100 text-blue-700',       label: 'Enviada'  },
        accepted: { cls: 'bg-emerald-100 text-emerald-700', label: 'Aceita'   },
        rejected: { cls: 'bg-red-100 text-red-600',         label: 'Recusada' },
        expired:  { cls: 'bg-slate-100 text-slate-400',     label: 'Expirada' }
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
