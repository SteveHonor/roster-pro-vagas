<template>
  <Drawer
    context="vagas-candidate"
    :exit-button="true"
    :on-save="null"
  >
    <div v-if="application && application.id" class="space-y-6">

      <!-- Perfil -->
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-700 text-sm font-bold text-white">
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-slate-800">{{ application.candidate?.name }}</p>
          <p v-if="application.candidate?.locationCity" class="text-xs text-slate-400">
            {{ application.candidate.locationCity }}
          </p>
          <span :class="viaBadge(application.appliedVia).cls" class="mt-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold">
            {{ viaBadge(application.appliedVia).label }}
          </span>
        </div>
      </div>

      <!-- Contato -->
      <div class="space-y-1.5">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contato</p>
        <div v-if="application.candidate?.email" class="flex items-center gap-2 text-sm text-slate-600">
          <BaseIcon name="Envelope" class="!size-4 flex-shrink-0 text-slate-400" />
          <a :href="`mailto:${application.candidate.email}`" class="hover:underline">{{ application.candidate.email }}</a>
        </div>
        <div v-if="application.candidate?.phone" class="flex items-center gap-2 text-sm text-slate-600">
          <BaseIcon name="Phone" class="!size-4 flex-shrink-0 text-slate-400" />
          <span>{{ application.candidate.phone }}</span>
        </div>
        <div v-if="application.candidate?.linkedinUrl" class="flex items-center gap-2 text-sm text-slate-600">
          <BaseIcon name="LinkedIn" class="!size-4 flex-shrink-0 text-slate-400" />
          <a :href="application.candidate.linkedinUrl" target="_blank" rel="noopener" class="hover:underline">LinkedIn</a>
        </div>
      </div>

      <!-- Rating -->
      <div>
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Avaliação</p>
        <div class="flex gap-1">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="transition-transform hover:scale-110"
            @click="setRating(n)"
          >
            <BaseIcon
              name="Star"
              class="!size-5"
              :style="n <= localRating ? { color: 'var(--brand-primary, #2563eb)' } : {}"
              :class="n > localRating ? 'text-slate-200' : ''"
            />
          </button>
        </div>
      </div>

      <!-- Cover letter -->
      <div v-if="application.coverLetter">
        <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Carta de apresentação</p>
        <div class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-sm leading-relaxed text-slate-700">{{ application.coverLetter }}</p>
        </div>
      </div>

      <!-- Notas internas -->
      <div>
        <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Notas internas</p>
        <textarea
          v-model="localNotes"
          rows="4"
          placeholder="Anotações visíveis apenas para o time de RH..."
          class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          @blur="saveNotes"
        />
      </div>

      <!-- Ações -->
      <div class="space-y-2">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ações</p>
        <div class="flex gap-2">
          <button
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            @click="$emit('schedule-interview')"
          >
            <BaseIcon name="Calendar" class="!size-4" />
            Agendar entrevista
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            @click="$emit('send-offer')"
          >
            <BaseIcon name="DocumentText" class="!size-4" />
            Enviar proposta
          </button>
        </div>
        <div class="flex gap-2">
          <button
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
            @click="archiveApplication"
          >
            <BaseIcon name="ArchiveBox" class="!size-4" />
            Arquivar
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
            @click="rejectApplication"
          >
            <BaseIcon name="XMark" class="!size-4" />
            Reprovar
          </button>
        </div>
      </div>

    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import BaseIcon from '@/components/icons/BaseIcon';
import { useVagasStore } from '@/modules/vagas/store';
import { useDrawerStore } from '@/components/drawer/store';
import vagasService from '@/services/vagas';

export default {
  components: { Drawer, BaseIcon },

  emits: ['schedule-interview', 'send-offer', 'updated'],

  data() {
    return {
      localRating: 0,
      localNotes: ''
    };
  },

  computed: {
    vagasStore: () => useVagasStore(),
    drawerStore: () => useDrawerStore(),
    application() {
      return this.vagasStore.application || {};
    },
    initials() {
      const name = this.application.candidate?.name || '';
      return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }
  },

  watch: {
    application(val) {
      this.localRating = val?.rating || 0;
      this.localNotes = val?.internalNotes || '';
    }
  },

  methods: {
    viaBadge(via) {
      return {
        form: { cls: 'bg-blue-100 text-blue-700', label: 'Formulário' },
        whatsapp: { cls: 'bg-green-100 text-green-700', label: 'WhatsApp' },
        linkedin: { cls: 'bg-sky-100 text-sky-700', label: 'LinkedIn' },
        manual: { cls: 'bg-slate-100 text-slate-600', label: 'Manual' }
      }[via] || { cls: 'bg-slate-100 text-slate-500', label: via };
    },

    async setRating(n) {
      this.localRating = n;
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { rating: n });
        this.vagasStore.updateApplicationRating(this.application.id, n);
      } catch (error) {
        console.error(error);
      }
    },

    async saveNotes() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { internalNotes: this.localNotes });
      } catch (error) {
        console.error(error);
      }
    },

    async archiveApplication() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { status: 'archived' });
        this.$emit('updated');
        this.drawerStore.close();
      } catch (error) {
        console.error(error);
      }
    },

    async rejectApplication() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { status: 'rejected' });
        this.$emit('updated');
        this.drawerStore.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
