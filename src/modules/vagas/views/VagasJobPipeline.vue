<template>
  <div class="flex flex-col gap-3">

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <button
          type="button"
          class="mt-0.5 flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50"
          @click="$router.push('/hiring')"
        >
          <BaseIcon name="ChevronLeft" class="!size-4" />
        </button>
        <div v-if="job">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-lg font-semibold text-slate-800">{{ job.title }}</h1>
            <span :class="statusBadge(job.status).cls" class="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold">
              {{ statusBadge(job.status).label }}
            </span>
          </div>
          <div class="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <BaseIcon :name="modalityIcon(job.modality)" class="!size-3.5" />
              {{ modalityLabel(job.modality) }}
            </span>
            <span v-if="job.locationCity && job.modality !== 'remote'">
              · {{ job.locationCity }}, {{ job.locationState }}
            </span>
            <span class="flex items-center gap-1">
              <BaseIcon name="Users" class="!size-3.5" />
              {{ totalActiveCandidates }} candidato{{ totalActiveCandidates !== 1 ? 's' : '' }}
            </span>
            <span class="flex items-center gap-1">
              <BaseIcon name="ChevronRight" class="!size-3.5" />
              {{ stages.length }} etapa{{ stages.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        <div v-else class="space-y-1.5 pt-0.5">
          <div class="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div class="h-3 w-32 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        @click="copyPublicLink"
      >
        <BaseIcon name="Clipboard" class="!size-4" />
        {{ copied ? 'Link copiado!' : 'Compartilhar vaga' }}
      </button>
    </div>

    <!-- Tips bar -->
    <div
      v-if="showTips"
      class="flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-600"
    >
      <BaseIcon name="Sparkles" class="!size-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
      <div class="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        <span>Clique num card para abrir o perfil completo do candidato.</span>
        <span>Arraste pelo <BaseIcon name="GripVertical" class="!size-3 inline-block align-middle" /> para reordenar candidatos na coluna.</span>
        <span>Use <strong>"Mover para"</strong> no card para avançar rapidamente sem abrir.</span>
        <span>Candidatos arquivados ou reprovados saem do pipeline automaticamente.</span>
      </div>
      <button type="button" class="flex-shrink-0 text-blue-300 hover:text-blue-500 transition" @click="showTips = false">
        <BaseIcon name="XMark" class="!size-3.5" />
      </button>
    </div>

    <!-- Kanban skeleton -->
    <div
      v-if="loading"
      class="scrollbar-hide overflow-x-auto overflow-y-hidden" style="height: 60vh;"
    >
      <div class="flex h-full min-w-full gap-2.5 pb-1">
        <div
          v-for="col in 4"
          :key="col"
          class="flex h-full min-w-[200px] flex-1 flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/[0.06]"
        >
          <div class="h-0.5 flex-shrink-0 animate-pulse bg-slate-200" />
          <div class="flex flex-shrink-0 items-center gap-2 px-3 py-2.5">
            <div class="h-2.5 w-24 animate-pulse rounded bg-slate-200" />
            <div class="ml-auto h-4 w-5 animate-pulse rounded bg-slate-100" />
          </div>
          <div class="flex flex-1 flex-col gap-2 border-t border-slate-100 bg-slate-50/60 p-2">
            <div
              v-for="card in (col === 1 ? 3 : col === 2 ? 2 : 1)"
              :key="card"
              class="rounded-md border border-slate-200/70 bg-white p-3 shadow-sm"
            >
              <div class="flex items-start gap-2.5">
                <div class="mt-0.5 h-7 w-7 flex-shrink-0 animate-pulse rounded-md bg-slate-200" />
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div class="h-2 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div class="mt-2.5 flex items-center justify-between">
                <div class="h-4 w-16 animate-pulse rounded bg-slate-100" />
                <div class="h-2 w-8 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kanban board -->
    <div
      v-else
      class="scrollbar-hide overflow-x-auto overflow-y-hidden" style="height: 60vh;"
    >
      <div class="flex h-full min-w-full gap-2.5 pb-1">

        <div
          v-for="stage in stages"
          :key="stage.id"
          class="flex h-full min-w-[200px] flex-1 flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/[0.06]"
        >
          <!-- Top accent bar -->
          <div class="h-0.5 flex-shrink-0" :style="{ backgroundColor: stage.color || '#94a3b8' }" />

          <!-- Column header -->
          <div class="flex flex-shrink-0 items-center gap-2 px-3 py-2.5">
            <span class="flex-1 truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {{ stage.name }}
            </span>
            <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              {{ applicationsInStage(stage.id).length }}
            </span>
          </div>

          <!-- Card list (draggable) -->
          <VueDraggable
            tag="div"
            :list="applicationsInStage(stage.id)"
            ghost-class="opacity-40"
            chosen-class="ring-2 ring-blue-300"
            handle=".drag-handle"
            animation="150"
            class="scrollbar-hide flex min-h-[56px] flex-1 flex-col gap-2 overflow-y-auto border-t border-slate-100 bg-slate-50/60 p-2"
            @end="(e) => onDragEnd(e, stage)"
          >
            <div
              v-for="(app, appIdx) in applicationsInStage(stage.id)"
              :key="app.id"
              class="group cursor-pointer rounded-md border border-slate-200/70 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow"
              @click="openCandidate(app)"
            >
              <!-- Avatar + Name -->
              <div class="flex items-start gap-2.5">
                <div
                  class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                  :style="{ backgroundColor: avatarColor(app.candidate?.name) }"
                >
                  {{ (app.candidate?.name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium leading-snug text-slate-800">{{ app.candidate?.name }}</p>
                  <p v-if="app.candidate?.phone" class="truncate text-[10px] leading-tight text-slate-400">
                    {{ app.candidate.phone }}
                  </p>
                  <p v-if="app.candidate?.email" class="truncate text-[10px] leading-tight text-slate-400">
                    {{ app.candidate.email }}
                  </p>
                </div>
                <!-- Position badge + drag handle -->
                <div class="flex flex-shrink-0 flex-col items-end gap-1 ml-1">
                  <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 tabular-nums leading-none">
                    {{ appIdx + 1 }}º
                  </span>
                  <div
                    class="drag-handle flex cursor-grab items-center justify-center rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                    title="Arraste para reordenar"
                    @click.stop
                  >
                    <BaseIcon name="GripVertical" class="!size-3.5" />
                  </div>
                </div>
              </div>

              <!-- Meta row: via badge + match + days -->
              <div class="mt-2.5 flex items-center justify-between">
                <span
                  :class="viaBadge(app.appliedVia).cls"
                  :title="`Candidatura via ${viaBadge(app.appliedVia).label}`"
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                >
                  {{ viaBadge(app.appliedVia).label }}
                </span>
                <div class="flex items-center gap-1.5">
                  <span
                    v-if="app.matchScore != null"
                    :class="matchScoreCls(app.matchScore)"
                    class="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    title="Match com a vaga"
                  >
                    {{ app.matchScore }}%
                  </span>
                  <span
                    class="text-[10px] text-slate-400"
                    :title="`${daysInStage(app)} dia(s) nesta etapa`"
                  >
                    {{ daysInStage(app) === 0 ? 'hoje' : `há ${daysInStage(app)}d` }}
                  </span>
                </div>
              </div>

              <!-- Interview / offer indicator row -->
              <div
                v-if="app.nextInterview || app.activeOffer"
                class="mt-2 flex flex-wrap gap-1"
              >
                <span
                  v-if="app.nextInterview"
                  :class="app.nextInterview.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'"
                  class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  :title="`Entrevista ${app.nextInterview.status === 'scheduled' ? 'agendada' : app.nextInterview.status}`"
                >
                  <BaseIcon name="Calendar" class="!size-3 flex-shrink-0" />
                  {{ formatCardDate(app.nextInterview.scheduledAt) }}
                </span>
                <span
                  v-if="app.activeOffer"
                  :class="offerCardCls(app.activeOffer.status)"
                  class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                >
                  <BaseIcon name="DocumentText" class="!size-3 flex-shrink-0" />
                  {{ offerCardLabel(app.activeOffer.status) }}
                </span>
              </div>

              <!-- Advance button -->
              <div v-if="nextStage(stage)" class="mt-2 border-t border-slate-100 pt-1.5">
                <button
                  class="flex w-full items-center justify-between rounded px-1 py-0.5 text-[10px] text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  @click.stop="moveToNextStage(app, stage)"
                >
                  <span class="truncate">Mover para {{ nextStage(stage).name }}</span>
                  <BaseIcon name="ChevronRight" class="!size-3 flex-shrink-0" />
                </button>
              </div>
            </div>
          </VueDraggable>

          <!-- Empty state -->
          <div
            v-if="!applicationsInStage(stage.id).length"
            class="flex items-center justify-center border-t border-slate-100 bg-slate-50/60 px-4 py-5"
          >
            <p class="text-xs text-slate-300">Sem candidatos</p>
          </div>

        </div>

        <!-- No stages configured -->
        <div v-if="!stages.length" class="flex items-center justify-center">
          <p class="text-sm text-slate-400">Nenhum stage de pipeline configurado para esta vaga.</p>
        </div>

      </div>
    </div>

    <!-- Drawer de candidato -->
    <VagasCandidateDrawer
      @schedule-interview="showInterviewModal = true"
      @send-offer="showOfferModal = true"
      @updated="reloadApplications"
    />

    <!-- Modal de entrevista -->
    <VagasInterviewModal
      :open="showInterviewModal"
      :application-id="vagasStore.application?.id"
      @close="showInterviewModal = false"
    />

    <!-- Modal de proposta -->
    <VagasOfferModal
      :open="showOfferModal"
      :application-id="vagasStore.application?.id"
      @close="showOfferModal = false"
    />
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import VagasCandidateDrawer from '@/modules/vagas/components/VagasCandidateDrawer';
import VagasInterviewModal from '@/modules/vagas/components/VagasInterviewModal';
import VagasOfferModal from '@/modules/vagas/components/VagasOfferModal';
import { VueDraggable } from 'vue-draggable-plus';
import { useVagasStore } from '@/modules/vagas/store';
import { useAuthStore } from '@/modules/auth/store';
import { useDrawerStore } from '@/components/drawer/store';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import vagasService from '@/services/vagas';

export default {
  components: { BaseIcon, VagasCandidateDrawer, VagasInterviewModal, VagasOfferModal, VueDraggable },

  data() {
    return {
      loading: true,
      job: null,
      showInterviewModal: false,
      showOfferModal: false,
      copied: false,
      showTips: true
    };
  },

  computed: {
    vagasStore: () => useVagasStore(),
    drawerStore: () => useDrawerStore(),
    breadcrumbStore: () => useBreadcrumbStore(),
    stages() { return this.vagasStore.stages; },
    applications() { return this.vagasStore.applications; },
    totalActiveCandidates() {
      return this.applications.filter(a => a.status === 'active').length;
    }
  },

  async mounted() {
    const id = this.$route.params.id;
    try {
      const [job, stages, applications] = await Promise.all([
        vagasService.fetchJob(id),
        vagasService.fetchPipelineStages(id),
        vagasService.fetchApplications(id)
      ]);
      this.job = job;
      this.breadcrumbStore.setBreadcrumb([
        { name: 'Vagas', path: '/hiring' },
        { name: job.title }
      ]);
      this.vagasStore.setStages(stages);
      this.vagasStore.setApplications(applications);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    applicationsInStage(stageId) {
      const sorted = [...this.stages].sort((a, b) => a.position - b.position);
      const isFirstStage = sorted[0]?.id === stageId;
      return this.applications
        .filter(a => {
          if (a.status !== 'active') return false;
          return a.stageId === stageId || (isFirstStage && !a.stageId);
        })
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    },

    nextStage(currentStage) {
      const sorted = [...this.stages].sort((a, b) => a.position - b.position);
      const idx = sorted.findIndex(s => s.id === currentStage.id);
      return sorted[idx + 1] || null;
    },

    daysInStage(app) {
      const ref = app.updatedAt || app.createdAt;
      return Math.floor((Date.now() - new Date(ref)) / 86400000);
    },

    statusBadge(status) {
      return {
        draft: { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused: { cls: 'bg-amber-100 text-amber-700', label: 'Pausada' },
        closed: { cls: 'bg-red-100 text-red-600', label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityIcon(modality) {
      return { remote: 'Pin', hybrid: 'Clock', presential: 'Company' }[modality] || 'Pin';
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    },

    matchScoreCls(score) {
      if (score >= 75) return 'bg-emerald-100 text-emerald-700';
      if (score >= 50) return 'bg-amber-100 text-amber-700';
      return 'bg-red-100 text-red-600';
    },

    viaBadge(via) {
      return {
        form:     { cls: 'bg-blue-100 text-blue-700',   label: 'Formulário' },
        whatsapp: { cls: 'bg-green-100 text-green-700', label: 'WhatsApp'   },
        linkedin: { cls: 'bg-sky-100 text-sky-700',     label: 'LinkedIn'   },
        manual:   { cls: 'bg-slate-100 text-slate-600', label: 'Manual'     }
      }[via] || { cls: 'bg-slate-100 text-slate-500', label: via };
    },

    formatCardDate(v) {
      if (!v) return '';
      const d = new Date(v);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    },

    offerCardCls(status) {
      return {
        sent:     'bg-indigo-50 text-indigo-600',
        draft:    'bg-slate-100 text-slate-500',
        accepted: 'bg-emerald-50 text-emerald-600',
        rejected: 'bg-red-50 text-red-500',
        expired:  'bg-slate-100 text-slate-400'
      }[status] || 'bg-slate-100 text-slate-500';
    },

    offerCardLabel(status) {
      return {
        sent:     'Proposta enviada',
        draft:    'Proposta rascunho',
        accepted: 'Proposta aceita',
        rejected: 'Proposta recusada',
        expired:  'Proposta expirada'
      }[status] || 'Proposta';
    },

    avatarColor(name) {
      const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#10b981', '#14b8a6', '#3b82f6', '#0ea5e9', '#a855f7'];
      let hash = 0;
      for (const c of (name || '')) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
      return palette[Math.abs(hash) % palette.length];
    },

    openCandidate(application) {
      this.vagasStore.setApplication(application);
      this.drawerStore.setDrawer({
        title: application.candidate?.name || 'Candidato',
        context: 'vagas-candidate',
        open: true,
        size: 'medium'
      });
    },

    async moveToNextStage(application, currentStage) {
      const next = this.nextStage(currentStage);
      if (!next) return;
      try {
        await vagasService.moveApplicationStage(this.$route.params.id, application.id, next.id);
        this.vagasStore.moveApplication(application.id, next.id);
      } catch (error) {
        console.error(error);
      }
    },

    async onDragEnd(event, stage) {
      const { oldIndex, newIndex } = event;
      if (oldIndex === newIndex) return;
      const apps = [...this.applicationsInStage(stage.id)];
      const [moved] = apps.splice(oldIndex, 1);
      apps.splice(newIndex, 0, moved);
      apps.forEach((app, i) => {
        const storeApp = this.vagasStore.applications.find(a => a.id === app.id);
        if (storeApp) storeApp.position = i;
      });
      try {
        await vagasService.reorderApplications(this.$route.params.id, apps.map(a => a.id));
      } catch (e) {
        console.error(e);
      }
    },

    async reloadApplications() {
      const applications = await vagasService.fetchApplications(this.$route.params.id);
      this.vagasStore.setApplications(applications);
    },

    async copyPublicLink() {
      const authStore = useAuthStore();
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.rosterpro.com.br';
      const url = `${siteUrl}/empregos/${authStore.subdomain}/${this.$route.params.id}`;
      try {
        await navigator.clipboard.writeText(url);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      } catch {
        this.copied = false;
      }
    }
  }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
