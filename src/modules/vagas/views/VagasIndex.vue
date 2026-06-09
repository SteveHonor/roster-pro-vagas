<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold text-slate-800">Vagas</h1>
        <p class="text-xs text-slate-400">Gerencie suas vagas e candidatos</p>
      </div>
      <BaseButton icon="Plus" @click="$router.push('/vagas/nova')">
        Nova vaga
      </BaseButton>
    </div>

    <Tab :tabs="filterTabs">
      <template #tabs="{ activeTab }">
        <SkeletonRows v-if="loading" :rows="4" has-trailing />

        <div v-else-if="filteredJobs(activeTab).length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="job in filteredJobs(activeTab)"
            :key="job.id"
            class="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-semibold text-slate-800">{{ job.title }}</p>
                <p class="mt-0.5 text-xs text-slate-400">{{ job.department || 'Sem área definida' }}</p>
              </div>
              <span :class="statusBadge(job.status).cls" class="inline-flex flex-shrink-0 items-center rounded px-2 py-0.5 text-[11px] font-semibold">
                {{ statusBadge(job.status).label }}
              </span>
            </div>

            <div class="flex flex-col gap-1.5 text-xs text-slate-500">
              <div class="flex items-center gap-1.5">
                <BaseIcon :name="modalityIcon(job.modality)" class="!size-3.5 flex-shrink-0" />
                <span>{{ modalityLabel(job.modality) }}</span>
                <span v-if="job.locationCity && job.modality !== 'remote'">· {{ job.locationCity }}, {{ job.locationState }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <BaseIcon name="Briefcase" class="!size-3.5 flex-shrink-0" />
                <span>{{ employmentLabel(job.employmentType) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <BaseIcon name="Users" class="!size-3.5 flex-shrink-0" />
                <span>{{ job.applicationsCount || 0 }} candidatos</span>
              </div>
              <div v-if="job.publishedAt" class="flex items-center gap-1.5">
                <BaseIcon name="Clock" class="!size-3.5 flex-shrink-0" />
                <span>Publicada {{ timeAgo(job.publishedAt) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 border-t border-slate-100 pt-3">
              <button
                class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                @click="$router.push(`/vagas/${job.id}/pipeline`)"
              >
                <BaseIcon name="QueueList" class="!size-3.5" />
                Pipeline
              </button>
              <button
                class="flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                @click="$router.push(`/vagas/${job.id}/editar`)"
              >
                <BaseIcon name="Pencil" class="!size-3.5" />
              </button>
              <button
                v-if="job.status === 'published'"
                class="flex items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                @click="closeJob(job)"
              >
                <BaseIcon name="XMark" class="!size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <Empty
          v-else-if="!loading"
          title="Nenhuma vaga encontrada"
          :description="activeTab === 'all' ? 'Publique sua primeira vaga para começar a receber candidatos.' : 'Nenhuma vaga com esse status no momento.'"
        >
          <BaseButton v-if="activeTab === 'all'" icon="Plus" @click="$router.push('/vagas/nova')">
            Criar primeira vaga
          </BaseButton>
        </Empty>
      </template>
    </Tab>
  </div>
</template>

<script>
import Tab from '@/components/tab/Tab';
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import vagasService from '@/services/vagas';
import { useBreadcrumbStore } from '@/components/breadcrumb/store';
import { useConfirmationStore } from '@/components/confirmation/store';

export default {
  components: { Tab, BaseButton, BaseIcon, Empty, SkeletonRows },

  data() {
    return {
      loading: true,
      jobs: []
    };
  },

  computed: {
    breadcrumbStore:    () => useBreadcrumbStore(),
    confirmationStore:  () => useConfirmationStore(),
    filterTabs() {
      return [
        { key: 'all',       name: 'Todas',      icon: 'Squares',     badge: this.jobs.length || undefined },
        { key: 'published', name: 'Publicadas',  icon: 'CheckCircle', badge: this.countByStatus('published') || undefined },
        { key: 'draft',     name: 'Rascunhos',   icon: 'Pencil',      badge: this.countByStatus('draft') || undefined },
        { key: 'closed',    name: 'Encerradas',  icon: 'ArchiveBox',  badge: this.countByStatus('closed') || undefined }
      ];
    }
  },

  async mounted() {
    this.breadcrumbStore.setBreadcrumb([{ name: 'Vagas', path: '/vagas' }]);
    try {
      this.jobs = await vagasService.fetchJobs();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    countByStatus(key) {
      return this.jobs.filter(j => j.status === key).length;
    },

    filteredJobs(tab) {
      if (tab === 'all') return this.jobs;
      return this.jobs.filter(j => j.status === tab);
    },

    statusBadge(status) {
      return {
        draft:     { cls: 'bg-slate-100 text-slate-600', label: 'Rascunho' },
        published: { cls: 'bg-green-100 text-green-700', label: 'Publicada' },
        paused:    { cls: 'bg-amber-100 text-amber-700', label: 'Pausada'   },
        closed:    { cls: 'bg-red-100 text-red-600',     label: 'Encerrada' }
      }[status] || { cls: 'bg-slate-100 text-slate-500', label: status };
    },

    modalityIcon(modality) {
      return { remote: 'Pin', hybrid: 'Clock', presential: 'Company' }[modality] || 'Pin';
    },

    modalityLabel(modality) {
      return { remote: 'Remoto', hybrid: 'Híbrido', presential: 'Presencial' }[modality] || modality;
    },

    employmentLabel(type) {
      return {
        full_time:   'CLT / Integral',
        part_time:   'Meio período',
        internship:  'Estágio',
        freelance:   'Freelance',
        temporary:   'Temporário'
      }[type] || type;
    },

    timeAgo(dateStr) {
      const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
      if (diff === 0) return 'hoje';
      if (diff === 1) return 'há 1 dia';
      if (diff < 30) return `há ${diff} dias`;
      if (diff < 60) return 'há 1 mês';
      return `há ${Math.floor(diff / 30)} meses`;
    },

    closeJob(job) {
      this.confirmationStore.setConfirmation({
        title:       'Encerrar vaga?',
        description: `A vaga "${job.title}" será encerrada e não aceitará novos candidatos. Candidaturas existentes são preservadas.`,
        open:        true,
        confirmText: 'Encerrar vaga',
        onConfirm:   async () => {
          try {
            await this.axios.delete(`/vagas/jobs/${job.id}`);
            job.status = 'closed';
          } catch (error) {
            console.error(error);
          }
        },
        onCancel: () => this.confirmationStore.close()
      });
    }
  }
};
</script>
