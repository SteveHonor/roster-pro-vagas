<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <button
          class="mt-0.5 flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50"
          @click="$router.push('/vagas')"
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
          <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <BaseIcon :name="modalityIcon(job.modality)" class="!size-3.5" />
              {{ modalityLabel(job.modality) }}
            </span>
            <span v-if="job.locationCity && job.modality !== 'remote'">
              · {{ job.locationCity }}, {{ job.locationState }}
            </span>
          </div>
        </div>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        @click="copyPublicLink"
      >
        <BaseIcon name="Clipboard" class="!size-4" />
        {{ copied ? 'Link copiado!' : 'Compartilhar vaga' }}
      </button>
    </div>

    <!-- Loading -->
    <SkeletonRows v-if="loading" :rows="3" />

    <!-- Kanban board -->
    <div v-else class="scrollbar-hide flex gap-3 overflow-x-auto pb-4">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="flex min-w-52 flex-1 flex-col rounded-md border border-slate-200 bg-slate-50"
      >
        <!-- Cabeçalho da coluna -->
        <div class="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <span
            class="h-2.5 w-2.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: stage.color || '#94a3b8' }"
          />
          <span class="flex-1 text-xs font-semibold text-slate-700">{{ stage.name }}</span>
          <span class="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
            {{ applicationsInStage(stage.id).length }}
          </span>
        </div>

        <!-- Cards de candidatos -->
        <div class="flex flex-col gap-2 p-2">
          <div
            v-for="app in applicationsInStage(stage.id)"
            :key="app.id"
            class="cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            @click="openCandidate(app)"
          >
            <!-- Nome + localização -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-800">{{ app.candidate?.name }}</p>
                <p v-if="app.candidate?.locationCity" class="text-[11px] text-slate-400">{{ app.candidate.locationCity }}</p>
              </div>
              <span :class="viaBadge(app.appliedVia).cls" class="inline-flex flex-shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold">
                {{ viaBadge(app.appliedVia).label }}
              </span>
            </div>

            <!-- Rating -->
            <div class="mt-2 flex items-center gap-0.5">
              <BaseIcon
                v-for="n in 5"
                :key="n"
                name="Star"
                class="!size-3"
                :style="n <= (app.rating || 0) ? { color: 'var(--brand-primary, #2563eb)' } : {}"
                :class="n > (app.rating || 0) ? 'text-slate-200' : ''"
              />
              <span class="ml-1 text-[10px] text-slate-400">há {{ daysInStage(app) }}d</span>
            </div>

            <!-- Mover para próximo stage -->
            <div v-if="nextStage(stage)" class="mt-2 flex justify-end">
              <button
                class="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 transition hover:bg-slate-100"
                @click.stop="moveToNextStage(app, stage)"
              >
                <span class="truncate max-w-[6rem]">{{ nextStage(stage).name }}</span>
                <BaseIcon name="ChevronRight" class="!size-3 flex-shrink-0" />
              </button>
            </div>
          </div>

          <!-- Empty column -->
          <div v-if="!applicationsInStage(stage.id).length" class="rounded-md border border-dashed border-slate-200 py-6 text-center">
            <p class="text-[11px] text-slate-400">Nenhum candidato</p>
          </div>
        </div>
      </div>

      <!-- Empty board -->
      <div v-if="!stages.length" class="flex w-full items-center justify-center py-16">
        <p class="text-sm text-slate-400">Nenhum stage de pipeline configurado para esta vaga.</p>
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
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import VagasCandidateDrawer from '@/modules/vagas/components/VagasCandidateDrawer';
import VagasInterviewModal from '@/modules/vagas/components/VagasInterviewModal';
import VagasOfferModal from '@/modules/vagas/components/VagasOfferModal';
import { useVagasStore } from '@/modules/vagas/store';
import { useAuthStore } from '@/modules/auth/store';
import { useDrawerStore } from '@/components/drawer/store';
import vagasService from '@/services/vagas';

export default {
  components: { BaseIcon, SkeletonRows, VagasCandidateDrawer, VagasInterviewModal, VagasOfferModal },

  data() {
    return {
      loading: true,
      job: null,
      showInterviewModal: false,
      showOfferModal: false,
      copied: false
    };
  },

  computed: {
    vagasStore: () => useVagasStore(),
    drawerStore: () => useDrawerStore(),
    stages() {
      return this.vagasStore.stages;
    },
    applications() {
      return this.vagasStore.applications;
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
      return this.applications.filter(a => {
        if (a.status !== 'active') return false;
        return a.stageId === stageId || (isFirstStage && !a.stageId);
      });
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

    viaBadge(via) {
      return {
        form: { cls: 'bg-blue-100 text-blue-700', label: 'Form' },
        whatsapp: { cls: 'bg-green-100 text-green-700', label: 'WA' },
        linkedin: { cls: 'bg-sky-100 text-sky-700', label: 'LI' },
        manual: { cls: 'bg-slate-100 text-slate-600', label: 'Manual' }
      }[via] || { cls: 'bg-slate-100 text-slate-500', label: via };
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
