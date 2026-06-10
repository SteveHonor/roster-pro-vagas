<template>
  <Drawer context="vagas-candidate" :exit-button="true" :on-save="null">
    <template v-if="application && application.id" #header>
      <div class="flex items-center gap-3 min-w-0 flex-1 pr-4">
        <div
          class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow"
          :style="{ backgroundColor: stageColor }"
        >
          {{ initials }}
        </div>
        <div class="min-w-0">
          <p class="text-base font-semibold text-slate-800 leading-tight truncate">{{ application.candidate?.name }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-slate-400">Origem:</span>
              <span :class="viaBadge(application.appliedVia).cls" class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold">
                {{ viaBadge(application.appliedVia).label }}
              </span>
            </div>
            <span class="text-slate-200">·</span>
            <div v-if="currentStage" class="flex items-center gap-1">
              <span class="text-[10px] text-slate-400">Etapa:</span>
              <span
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold"
                :style="{ backgroundColor: stageColor + '18', color: stageColor }"
              >
                <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: stageColor }" />
                {{ currentStage.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-col gap-2">

        <!-- Contratado -->
        <div
          v-if="currentStage?.stageType === 'hired'"
          class="flex items-center justify-center gap-2 rounded-md bg-emerald-500 py-2.5 text-xs font-semibold text-white"
        >
          <BaseIcon name="CheckCircle" class="!size-4" />
          Candidato contratado
        </div>

        <!-- Avançar + Voltar na mesma linha -->
        <div
          v-if="currentStage?.stageType !== 'hired'"
          class="flex gap-2"
        >
          <button
            v-if="prevApplicationStage"
            type="button"
            class="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
            @click="retreatStage"
          >
            <BaseIcon name="ChevronLeft" class="!size-3.5" />
            Voltar para {{ prevApplicationStage.name }}
          </button>
          <button
            v-if="nextApplicationStage"
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]"
            :style="{ backgroundColor: nextApplicationStage.color || '#3b82f6' }"
            @click="advanceStage"
          >
            Avançar para {{ nextApplicationStage.name }}
            <BaseIcon name="ChevronRight" class="!size-4" />
          </button>
        </div>

        <!-- Ações secundárias -->
        <div class="flex gap-2">
          <button
            v-if="currentStage?.stageType === 'interview'"
            type="button"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            @click="$emit('schedule-interview')"
          >
            <BaseIcon name="Calendar" class="!size-3.5 text-slate-400" />
            Agendar
          </button>
          <button
            v-if="currentStage?.stageType === 'offer'"
            type="button"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            @click="$emit('send-offer')"
          >
            <BaseIcon name="DocumentText" class="!size-3.5 text-slate-400" />
            Proposta
          </button>
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            @click="archiveApplication"
          >
            <BaseIcon name="ArchiveBox" class="!size-3.5" />
            Arquivar
          </button>
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2.5 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            @click="rejectApplication"
          >
            <BaseIcon name="XMark" class="!size-3.5" />
            Reprovar
          </button>
        </div>

      </div>
    </template>

    <div v-if="application && application.id" class="flex flex-col">

      <!-- ── Posição na etapa ───────────────────────────── -->
      <div v-if="applicationsInCurrentStage.length > 1" class="pb-4">
        <p class="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Posição na etapa</p>
        <div class="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="currentPositionIndex === 0"
            @click="movePositionUp"
          >
            <BaseIcon name="ChevronUp" class="!size-3.5" />
            Subir
          </button>
          <div class="flex flex-1 flex-col items-center">
            <span class="text-2xl font-black tabular-nums leading-none" :style="{ color: stageColor }">
              {{ currentPositionIndex + 1 }}º
            </span>
            <span class="mt-0.5 text-[10px] text-slate-400">de {{ applicationsInCurrentStage.length }}</span>
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="currentPositionIndex === applicationsInCurrentStage.length - 1"
            @click="movePositionDown"
          >
            Descer
            <BaseIcon name="ChevronDown" class="!size-3.5" />
          </button>
        </div>
      </div>

      <!-- ── Contato ──────────────────────────────────── -->
      <div class="pb-4 space-y-2.5">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Contato</p>

        <div v-if="application.candidate?.email" class="flex items-center gap-2.5 text-sm text-slate-600">
          <BaseIcon name="Envelope" class="!size-4 flex-shrink-0 text-slate-300" />
          <a :href="`mailto:${application.candidate.email}`" class="hover:text-blue-600 hover:underline truncate">
            {{ application.candidate.email }}
          </a>
        </div>

        <div v-if="application.candidate?.phone" class="flex items-center gap-2.5 text-sm text-slate-600">
          <BaseIcon name="Phone" class="!size-4 flex-shrink-0 text-slate-300" />
          <span>{{ application.candidate.phone }}</span>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <a
            v-if="application.candidate?.linkedinUrl"
            :href="application.candidate.linkedinUrl"
            target="_blank" rel="noopener"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <BaseIcon name="LinkedIn" class="!size-3.5 text-sky-500" />
            LinkedIn
            <BaseIcon name="ExternalLink" class="!size-3 text-slate-300" />
          </a>
          <a
            v-if="application.candidate?.resumeUrl"
            :href="application.candidate.resumeUrl"
            target="_blank" rel="noopener"
            class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100"
          >
            <BaseIcon name="DocumentText" class="!size-3.5" />
            Currículo (PDF)
            <BaseIcon name="ExternalLink" class="!size-3 text-blue-400" />
          </a>
        </div>
      </div>

      <!-- ── Match ──────────────────────────────────────── -->
      <div v-if="application.candidate?.resumeUrl" class="border-t border-slate-100 pt-4 pb-4">
        <div class="mb-3 flex items-center justify-between">
          <p class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            <BaseIcon name="Sparkles" class="!size-3.5 text-violet-400" />
            Match com a vaga
          </p>
          <button
            v-if="!localMatchScore && !matching"
            type="button"
            class="text-[10px] font-medium text-violet-500 transition hover:text-violet-700"
            @click="computeMatch"
          >
            Calcular
          </button>
          <button
            v-else-if="localMatchScore"
            type="button"
            class="text-[10px] text-slate-400 transition hover:text-slate-600"
            @click="computeMatch(true)"
          >
            Recalcular
          </button>
        </div>

        <!-- Score computed -->
        <div v-if="localMatchScore != null && !matching" class="space-y-2">
          <!-- Score ring + label -->
          <div class="flex items-center gap-3">
            <div
              class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-black"
              :class="matchScoreCls(localMatchScore).ring"
            >
              <span :class="matchScoreCls(localMatchScore).text">{{ localMatchScore }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold" :class="matchScoreCls(localMatchScore).text">
                {{ matchScoreCls(localMatchScore).label }}
              </p>
              <p class="text-xs text-slate-400">compatibilidade com a vaga</p>
            </div>
          </div>

          <!-- Strengths -->
          <div v-if="localMatchReasons.strengths?.length" class="space-y-1">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Pontos fortes</p>
            <div
              v-for="(s, i) in localMatchReasons.strengths"
              :key="i"
              class="flex items-start gap-1.5 text-xs text-slate-600"
            >
              <BaseIcon name="Check" class="!size-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
              {{ s }}
            </div>
          </div>

          <!-- Gaps -->
          <div v-if="localMatchReasons.gaps?.length" class="space-y-1">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Pontos de atenção</p>
            <div
              v-for="(g, i) in localMatchReasons.gaps"
              :key="i"
              class="flex items-start gap-1.5 text-xs text-slate-600"
            >
              <BaseIcon name="ExclamationCircle" class="!size-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
              {{ g }}
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-else-if="matching" class="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
          <div class="flex items-center gap-2 mb-2">
            <BaseIcon name="Sparkles" class="!size-4 animate-pulse text-violet-400" />
            <span class="text-xs text-slate-400">Calculando compatibilidade…</span>
          </div>
          <div class="h-2 w-1/3 animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-2/3 animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-1/2 animate-pulse rounded-full bg-slate-200" />
        </div>

        <!-- Empty state -->
        <button
          v-else
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-xs font-medium text-slate-400 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
          @click="computeMatch(false)"
        >
          <BaseIcon name="Sparkles" class="!size-4" />
          Calcular match com a vaga
        </button>

        <div
          v-if="matchError"
          class="mt-2 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500"
        >
          <BaseIcon name="XMark" class="!size-3.5 flex-shrink-0" />
          {{ matchError }}
        </div>
      </div>

      <!-- ── Resumo IA ─────────────────────────────────── -->
      <div v-if="application.candidate?.resumeUrl" class="border-t border-slate-100 pt-4 pb-4">
        <div class="mb-3">
          <p class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            <BaseIcon name="Sparkles" class="!size-3.5 text-violet-400" />
            Resumo IA
          </p>
        </div>

        <!-- Summary rendered -->
        <div
          v-if="localSummary && !summarizing"
          class="rounded-md border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          <div class="summary-body" v-html="formattedSummary" />
          <button
            v-if="localSummary.length > 500"
            type="button"
            class="mt-2 text-xs font-medium text-blue-500 hover:text-blue-700 transition"
            @click="summaryExpanded = !summaryExpanded"
          >
            {{ summaryExpanded ? 'Ver menos' : 'Ver mais...' }}
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="summarizing" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <BaseIcon name="Sparkles" class="!size-4 animate-pulse text-violet-400" />
            <span class="text-xs text-slate-400">Analisando currículo…</span>
          </div>
          <div class="h-2 w-2/3 animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-full animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-5/6 animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-3/4 animate-pulse rounded-full bg-slate-200" />
          <div class="h-2 w-full animate-pulse rounded-full bg-slate-200" />
        </div>

        <!-- Empty state -->
        <button
          v-else
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-xs font-medium text-slate-400 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
          @click="generateSummary(false)"
        >
          <BaseIcon name="Sparkles" class="!size-4" />
          Gerar resumo com IA
        </button>

        <div
          v-if="summaryError"
          class="mt-2 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500"
        >
          <BaseIcon name="XMark" class="!size-3.5 flex-shrink-0" />
          {{ summaryError }}
        </div>
      </div>

      <!-- ── Notas internas ───────────────────────────── -->
      <div class="border-t border-slate-100 pt-4 pb-4">
        <div class="mb-2.5 flex items-center justify-between">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Notas internas</p>
          <span
            v-if="notesSaved"
            class="flex items-center gap-1 text-[10px] text-emerald-500 transition"
          >
            <BaseIcon name="CheckCircle" class="!size-3" />
            Salvo
          </span>
        </div>
        <textarea
          v-model="localNotes"
          rows="3"
          placeholder="Adicione observações sobre este candidato…"
          class="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
          @blur="saveNotes"
        />
        <div class="mt-2 flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
          <BaseIcon name="LockClosed" class="!size-3.5 flex-shrink-0 text-slate-400" />
          <span>Visível apenas para o seu time · Salvo automaticamente ao sair do campo</span>
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
      localNotes:   '',
      localSummary: '',
      summarizing:  false,
      summaryError: '',
      notesSaved:      false,
      summaryExpanded: false,
      localMatchScore:   null,
      localMatchReasons: {},
      matching:   false,
      matchError: ''
    };
  },

  computed: {
    vagasStore:  () => useVagasStore(),
    drawerStore: () => useDrawerStore(),

    application() { return this.vagasStore.application || {}; },

    initials() {
      const name = this.application.candidate?.name || '';
      return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },

    currentStage() {
      const id = this.application.stageId;
      if (!id) return this.vagasStore.stages[0] || null;
      return this.vagasStore.stages.find(s => s.id === id) || null;
    },

    stageColor() { return this.currentStage?.color || '#475569'; },

    nextApplicationStage() {
      if (!this.currentStage) return null;
      const sorted = [...this.vagasStore.stages].sort((a, b) => a.position - b.position);
      const idx = sorted.findIndex(s => s.id === this.currentStage.id);
      return sorted[idx + 1] || null;
    },

    prevApplicationStage() {
      if (!this.currentStage) return null;
      const sorted = [...this.vagasStore.stages].sort((a, b) => a.position - b.position);
      const idx = sorted.findIndex(s => s.id === this.currentStage.id);
      return idx > 0 ? sorted[idx - 1] : null;
    },

    stageActionStyle() {
      const c = this.stageColor;
      return { borderColor: c + '40', backgroundColor: c + '12', color: c };
    },

    applicationsInCurrentStage() {
      if (!this.currentStage) return [];
      const stageId = this.currentStage.id;
      const sorted = [...this.vagasStore.stages].sort((a, b) => a.position - b.position);
      const isFirstStage = sorted[0]?.id === stageId;
      return this.vagasStore.applications
        .filter(a => {
          if (a.status !== 'active') return false;
          return a.stageId === stageId || (isFirstStage && !a.stageId);
        })
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    },

    currentPositionIndex() {
      return this.applicationsInCurrentStage.findIndex(a => a.id === this.application?.id);
    },

    formattedSummary() {
      if (!this.localSummary) return '';
      const raw = this.summaryExpanded || this.localSummary.length <= 500
        ? this.localSummary
        : this.localSummary.slice(0, 500).trimEnd() + '…';
      const lines = raw.split('\n');
      let html = '';

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const line = raw.trim();

        if (!line) continue;

        // h1 — skip (usually just the candidate name repeated)
        if (/^#\s/.test(line)) continue;

        // h2 — section header
        if (/^##\s/.test(line)) {
          const text = line.replace(/^##\s+/, '');
          html += `<p class="summary-h2">${text}</p>`;
          continue;
        }

        // list item with optional bold label  "- **Label:** text"
        if (/^-\s/.test(line)) {
          const content = line
            .replace(/^-\s+/, '')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          html += `<div class="summary-li">• ${content}</div>`;
          continue;
        }

        // numbered list  "1. text"
        if (/^\d+\.\s/.test(line)) {
          const content = line
            .replace(/^\d+\.\s+/, '')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          html += `<div class="summary-li summary-li--num">${content}</div>`;
          continue;
        }

        // regular paragraph
        const content = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html += `<p class="summary-p">${content}</p>`;
      }

      return html;
    }
  },

  watch: {
    application(val) {
      this.localNotes      = val?.internalNotes || '';
      this.localSummary    = val?.aiSummary || '';
      this.summaryError    = '';
      this.summaryExpanded = false;
      this.localMatchScore   = val?.matchScore ?? null;
      this.localMatchReasons = val?.matchReasons || {};
      this.matchError        = '';
    }
  },

  methods: {
    viaBadge(via) {
      return {
        form:     { cls: 'bg-blue-100 text-blue-700',   label: 'Formulário' },
        whatsapp: { cls: 'bg-green-100 text-green-700', label: 'WhatsApp'   },
        linkedin: { cls: 'bg-sky-100 text-sky-700',     label: 'LinkedIn'   },
        manual:   { cls: 'bg-slate-100 text-slate-600', label: 'Manual'     }
      }[via] || { cls: 'bg-slate-100 text-slate-500', label: via };
    },

    async saveNotes() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { internalNotes: this.localNotes });
        this.notesSaved = true;
        setTimeout(() => { this.notesSaved = false; }, 2000);
      } catch (e) { console.error(e); }
    },

    async generateSummary(force = false) {
      if (this.summarizing) return;
      if (!force && this.localSummary) return;
      this.summarizing  = true;
      this.summaryError = '';
      try {
        const data = await vagasService.summarizeApplication(this.application.jobId, this.application.id);
        this.localSummary = data.summary;
        if (this.vagasStore.application) this.vagasStore.application.aiSummary = data.summary;
      } catch (e) {
        this.summaryError = e?.response?.data?.error || 'Erro ao gerar resumo. Tente novamente.';
      } finally {
        this.summarizing = false;
      }
    },

    async advanceStage() {
      const next = this.nextApplicationStage;
      if (!next || !this.application?.id) return;
      try {
        await vagasService.moveApplicationStage(this.application.jobId, this.application.id, next.id);
        this.vagasStore.moveApplication(this.application.id, next.id);
        if (this.vagasStore.application) this.vagasStore.application.stageId = next.id;
        this.$emit('updated');
      } catch (e) { console.error(e); }
    },

    async retreatStage() {
      const prev = this.prevApplicationStage;
      if (!prev || !this.application?.id) return;
      try {
        await vagasService.moveApplicationStage(this.application.jobId, this.application.id, prev.id);
        this.vagasStore.moveApplication(this.application.id, prev.id);
        if (this.vagasStore.application) this.vagasStore.application.stageId = prev.id;
        this.$emit('updated');
      } catch (e) { console.error(e); }
    },

    async archiveApplication() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { status: 'archived' });
        this.$emit('updated');
        this.drawerStore.close();
      } catch (e) { console.error(e); }
    },

    async computeMatch(force = false) {
      if (this.matching) return;
      if (!force && this.localMatchScore != null) return;
      this.matching   = true;
      this.matchError = '';
      try {
        const data = await vagasService.matchScoreApplication(this.application.jobId, this.application.id);
        this.localMatchScore   = data.score;
        this.localMatchReasons = { strengths: data.strengths, gaps: data.gaps };
        if (this.vagasStore.application) {
          this.vagasStore.application.matchScore   = data.score;
          this.vagasStore.application.matchReasons = this.localMatchReasons;
        }
        const storeApp = this.vagasStore.applications?.find(a => a.id === this.application.id);
        if (storeApp) storeApp.matchScore = data.score;
      } catch (e) {
        this.matchError = e?.response?.data?.error || 'Erro ao calcular match. Tente novamente.';
      } finally {
        this.matching = false;
      }
    },

    matchScoreCls(score) {
      if (score >= 75) return { ring: 'bg-emerald-50 border-2 border-emerald-400', text: 'text-emerald-600', label: 'Excelente match' };
      if (score >= 50) return { ring: 'bg-amber-50 border-2 border-amber-400',   text: 'text-amber-600',   label: 'Match razoável' };
      return               { ring: 'bg-red-50 border-2 border-red-400',           text: 'text-red-600',     label: 'Match baixo' };
    },

    async rejectApplication() {
      try {
        await vagasService.updateApplication(this.application.jobId, this.application.id, { status: 'rejected' });
        this.$emit('updated');
        this.drawerStore.close();
      } catch (e) { console.error(e); }
    },

    async movePositionUp() {
      const idx = this.currentPositionIndex;
      if (idx <= 0) return;
      await this._reorderPosition(idx, idx - 1);
    },

    async movePositionDown() {
      const idx = this.currentPositionIndex;
      if (idx >= this.applicationsInCurrentStage.length - 1) return;
      await this._reorderPosition(idx, idx + 1);
    },

    async _reorderPosition(fromIdx, toIdx) {
      const apps = [...this.applicationsInCurrentStage];
      const [moved] = apps.splice(fromIdx, 1);
      apps.splice(toIdx, 0, moved);
      apps.forEach((app, i) => {
        const storeApp = this.vagasStore.applications.find(a => a.id === app.id);
        if (storeApp) storeApp.position = i;
      });
      try {
        await vagasService.reorderApplications(this.application.jobId, apps.map(a => a.id));
      } catch (e) { console.error(e); }
    }
  }
};
</script>

<style scoped>
.summary-body :deep(.summary-h2) {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 1rem 0 0.4rem;
}
.summary-body :deep(.summary-h2:first-child) { margin-top: 0; }

.summary-body :deep(.summary-p) {
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.55;
  margin: 0 0 0.35rem;
}

.summary-body :deep(.summary-li) {
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.5;
  padding-left: 0.25rem;
  margin: 0.15rem 0;
}

.summary-body :deep(.summary-li--num) {
  font-weight: 600;
  color: #334155;
  margin-top: 0.4rem;
}

.summary-body :deep(strong) {
  font-weight: 600;
  color: #1e293b;
}
</style>
