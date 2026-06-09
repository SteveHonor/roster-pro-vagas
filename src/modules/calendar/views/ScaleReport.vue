<template>
  <section class="space-y-6">
    <ScaleHeader />

    <Tab
      :tabs="hourTabs"
      :on-tab="onTabChange"
      :min-hight="false"
      class="mb-6"
      :to-back="() => $router.replace({ path: '/calendar', query: { tab: 'history' } })"
    >
      <template #tabs>
        <!-- Skeleton -->
        <div v-if="loadingScales" class="animate-pulse space-y-4">
          <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div v-for="i in 5" :key="i" class="h-20 rounded-md bg-slate-100" />
          </div>
          <SkeletonRows :rows="3" has-trailing />
        </div>

        <div v-else-if="scaleStore.reports?.scales?.length">
          <!-- Resumo -->
          <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div class="rounded-md border border-slate-200 bg-white p-4 text-center">
              <div class="text-xs text-slate-400">Equipes</div>
              <div class="text-3xl font-bold text-slate-700">{{ scaleStore.reports?.totals?.positions || 0 }}</div>
            </div>
            <div class="rounded-md border border-slate-200 bg-white p-4 text-center">
              <div class="text-xs text-slate-400">Escalados</div>
              <div class="text-3xl font-bold text-slate-700">{{ scaleStore.reports?.totals?.users || 0 }}</div>
            </div>
            <div class="rounded-md border border-green-100 bg-green-50 p-4 text-center">
              <div class="text-xs text-green-600">Aceitas</div>
              <div class="text-3xl font-bold text-green-700">{{ scaleStore.reports?.totals?.accepted || 0 }}</div>
            </div>
            <div class="rounded-md border border-red-100 bg-red-50 p-4 text-center">
              <div class="text-xs text-red-500">Recusas</div>
              <div class="text-3xl font-bold text-red-600">{{ scaleStore.reports?.totals?.declined || 0 }}</div>
            </div>
            <div class="rounded-md border border-orange-100 bg-orange-50 p-4 text-center">
              <div class="text-xs text-orange-500">Pendentes</div>
              <div class="text-3xl font-bold text-orange-600">{{ scaleStore.reports?.totals?.pending || 0 }}</div>
            </div>
          </div>

          <!-- Lista por equipe -->
          <div v-for="scale in scaleStore.reports.scales" :key="scale.team" class="mb-6 rounded-md border border-slate-200">
            <div class="rounded-t-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">
              {{ scale.team }}
            </div>

            <!-- Header: só desktop -->
            <div class="hidden sm:flex items-center gap-6 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-400">
              <div class="min-w-0 flex-1">Colaborador</div>
              <div class="min-w-0 flex-1">Cargo</div>
              <div class="w-28 shrink-0">Status</div>
              <div v-if="$can.canAccess('operator')" class="w-24 shrink-0">Presença</div>
              <div class="w-36 shrink-0 text-right">Avaliação</div>
            </div>

            <div
              v-for="(user, index) in [...scale.users].sort((a, b) => a.name.localeCompare(b.name))"
              :key="user.scheduleItemId"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
            >
              <!-- Mobile: card layout -->
              <div class="sm:hidden border-b border-slate-100 px-4 py-3 last:border-0">
                <div class="mb-2.5 flex items-start justify-between gap-2">
                  <div>
                    <div class="font-medium text-slate-800">{{ user.name }}</div>
                    <div class="text-xs text-slate-500">{{ user.position }}</div>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="scheduleStatus(user.status)?.color"
                  >
                    {{ scheduleStatus(user.status)?.text }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <!-- Presença mobile -->
                  <div v-if="$can.canAccess('operator')" class="flex gap-1">
                    <button
                      v-for="opt in attendanceOptions"
                      :key="opt.value"
                      class="flex h-7 w-7 items-center justify-center rounded transition"
                      :class="user.attendance === opt.value ? opt.activeClass : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
                      :title="opt.label"
                      @click="setAttendance(user, opt.value)"
                    >
                      <BaseIcon :name="opt.icon" class="!size-3.5" />
                    </button>
                  </div>
                  <!-- Avaliação mobile -->
                  <div class="flex items-center gap-2">
                    <div v-if="user.evaluated" class="flex gap-0.5">
                      <BaseIcon
v-for="star in 5" :key="star" name="star" class="h-3.5 w-3.5"
                        :class="star <= user.rating ? '[color:var(--brand-primary)]' : 'text-slate-200'" />
                    </div>
                    <span v-else class="text-xs text-slate-300">—</span>
                    <div v-if="$can.canAccess('operator') && authStore?.user?.id !== user.id" class="relative">
                      <button
class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        @click.stop="toggleMenu(user.scheduleItemId)">
                        <BaseIcon name="ellipsis-vertical" class="!size-4" />
                      </button>
                      <div
v-if="openMenuId === user.scheduleItemId"
                        class="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                        <button
v-for="opt in quickRateOptions" :key="opt.rating"
                          :disabled="user.quickRating"
                          class="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-slate-50"
                          @click.stop="quickRate(user, opt.rating); openMenuId = null">
                          <span class="h-2 w-2 rounded-full shrink-0" :class="opt.dotClass" />
                          {{ opt.label }}
                        </button>
                          <div class="my-1 border-t border-slate-100" />
                        <button
class="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          @click.stop="openFeedback(user); openMenuId = null">
                          <BaseIcon name="pencil-square" class="h-3.5 w-3.5 text-slate-500" />
                          Avaliação completa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop: linha de grid -->
              <div class="hidden sm:flex items-center gap-6 border-b border-slate-100 px-4 py-3 text-sm last:border-0">
                <div class="min-w-0 flex-1 font-medium text-slate-800 truncate">{{ user.name }}</div>
                <div class="min-w-0 flex-1 text-slate-500 truncate">{{ user.position }}</div>
                <div class="w-28 shrink-0">
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="scheduleStatus(user.status)?.color">
                    {{ scheduleStatus(user.status)?.text }}
                  </span>
                </div>

                <!-- Presença desktop -->
                <div v-if="$can.canAccess('operator')" class="w-24 shrink-0 flex gap-1">
                  <button
                    v-for="opt in attendanceOptions"
                    :key="opt.value"
                    class="flex h-7 w-7 items-center justify-center rounded transition"
                    :class="user.attendance === opt.value ? opt.activeClass : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
                    :title="opt.label"
                    @click="setAttendance(user, opt.value)"
                  >
                    <BaseIcon :name="opt.icon" class="!size-3.5" />
                  </button>
                </div>

                <!-- Avaliação desktop -->
                <div class="w-36 shrink-0 flex items-center justify-end gap-2">
                  <div v-if="user.evaluated" class="flex gap-0.5">
                    <BaseIcon
v-for="star in 5" :key="star" name="star" class="h-3.5 w-3.5"
                      :class="star <= user.rating ? '[color:var(--brand-primary)]' : 'text-slate-200'" />
                  </div>
                  <span v-else class="text-xs text-slate-300">—</span>
                  <div v-if="$can.canAccess('operator') && authStore?.user?.id !== user.id" class="relative">
                    <button
class="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      @click.stop="toggleMenu(user.scheduleItemId)">
                      <BaseIcon name="ellipsis-vertical" class="!size-4" />
                    </button>
                    <div
v-if="openMenuId === user.scheduleItemId"
                      class="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                      <button
v-for="opt in quickRateOptions" :key="opt.rating"
                        :disabled="user.quickRating"
                        class="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition hover:bg-slate-50"
                        @click.stop="quickRate(user, opt.rating); openMenuId = null">
                        <span class="h-2 w-2 rounded-full shrink-0" :class="opt.dotClass" />
                        {{ opt.label }}
                      </button>
                      <div class="my-1 border-t border-slate-100" />
                      <button
class="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        @click.stop="openFeedback(user); openMenuId = null">
                        <BaseIcon name="pencil-square" class="h-3.5 w-3.5 text-slate-500" />
                        Avaliação completa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div v-else>
          <Empty
            title="Nenhuma escala confirmada"
            description="Não houve colaboradores escalados neste horário."
          />
        </div>
      </template>
    </Tab>

    <!-- Feedback da Equipe -->
    <div v-if="$can.canAccess('operator') && workerFeedbacks.length" class="mt-10 rounded-md border border-slate-200 bg-white p-5">
      <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="sparkles" class="h-4 w-4 text-slate-400" />
        Feedback da Equipe
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{{ workerFeedbacks.length }}</span>
      </h3>
      <div class="space-y-3">
        <div v-for="fb in workerFeedbacks" :key="fb.id" class="rounded-md border border-slate-100 bg-slate-50 p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-700">{{ fb.user.name }}</span>
              <span class="text-xs text-slate-400">{{ moment(fb.createdAt).format('DD MMM') }}</span>
            </div>
            <div class="flex gap-0.5">
              <BaseIcon
v-for="star in 5" :key="star" name="star" class="h-4 w-4"
                :class="star <= fb.rating ? '[color:var(--brand-primary)]' : 'text-slate-200'" />
            </div>
          </div>
          <p v-if="fb.comment" class="text-sm text-slate-600">{{ fb.comment }}</p>
          <p v-else class="text-sm italic text-slate-400">Sem comentário.</p>
        </div>
      </div>
    </div>

    <!-- Relatórios da Liderança (admin) -->
    <div v-if="$can.canAccess('admin') && allTeamReports.length" class="mt-4 rounded-md border border-slate-200 bg-white p-5">
      <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Users" class="h-4 w-4 text-slate-400" /> Relatórios da Liderança
      </h3>
      <div class="space-y-4">
        <div v-for="group in reportsByTeam" :key="group.teamId">
          <p class="mb-2 text-xs font-semibold text-slate-600">{{ group.teamName }}</p>
          <div class="space-y-2 pl-3">
            <div v-for="r in group.reports" :key="r.id" class="rounded-md border border-slate-100 bg-slate-50 p-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-slate-600">{{ r.operatorName }}</span>
                <div class="flex gap-0.5">
                  <BaseIcon
v-for="star in 5" :key="star" name="Star" class="!size-3"
                    :class="star <= r.rating ? '[color:var(--brand-primary)]' : 'text-slate-200'" />
                </div>
              </div>
              <p v-if="r.notes" class="text-xs text-slate-500">{{ r.notes }}</p>
              <p v-else class="text-xs italic text-slate-400">Sem observações.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Relatório pós-evento -->
    <div v-if="$can.canAccess('operator')" class="mt-4 space-y-3">

      <!-- Header da seção -->
      <div class="flex items-center gap-2 px-1">
        <BaseIcon name="DocumentText" class="!size-4 text-slate-400" />
        <h3 class="text-sm font-semibold text-slate-700">Relatório pós-evento</h3>
        <span v-if="pendingTeamReportsCount > 0" class="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
          {{ pendingTeamReportsCount }} pendente{{ pendingTeamReportsCount > 1 ? 's' : '' }}
        </span>
        <span v-else-if="teamReports.length" class="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
          Completo
        </span>
      </div>

      <!-- Skeleton -->
      <div v-if="loadingTeamReports" class="space-y-3">
        <div v-for="i in 2" :key="i" class="h-32 animate-pulse rounded-md bg-slate-100" />
      </div>

      <!-- Sem equipes atribuídas -->
      <div v-else-if="!teamReports.length" class="rounded-md border border-slate-200 bg-white p-5 text-center text-sm text-slate-400 italic">
        Nenhuma equipe atribuída a você neste evento.
      </div>

      <!-- Card por equipe -->
      <div
        v-for="tr in teamReports"
        v-else
        :key="tr.teamId"
        class="rounded-md border bg-white p-5 transition-colors"
        :class="tr.saved && !tr.editing ? 'border-green-100' : 'border-slate-200'"
      >
        <!-- Cabeçalho do card -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full" :class="tr.saved && !tr.editing ? 'bg-green-400' : 'bg-orange-400'" />
            <span class="text-sm font-semibold text-slate-700">{{ tr.teamName }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="tr.saved && !tr.editing" class="flex items-center gap-1 text-[11px] font-medium text-green-500">
              <BaseIcon name="Check" class="!size-3" /> Salvo
            </span>
            <button
              v-if="tr.saved && !tr.editing"
              class="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              @click="tr.editing = true"
            >
              <BaseIcon name="Pencil" class="!size-3" /> Editar
            </button>
          </div>
        </div>

        <!-- Modo visualização -->
        <template v-if="tr.saved && !tr.editing">
          <div class="mb-2 flex gap-0.5">
            <BaseIcon
v-for="star in 5" :key="star" name="Star" class="!size-4"
              :class="star <= tr.rating ? '[color:var(--brand-primary)]' : 'text-slate-200'" />
          </div>
          <p v-if="tr.notes" class="whitespace-pre-wrap text-sm text-slate-600">{{ tr.notes }}</p>
          <p v-else class="text-sm italic text-slate-400">Sem observações.</p>
        </template>

        <!-- Modo edição / preenchimento -->
        <template v-else>
          <div class="mb-4">
            <label class="mb-2 block text-xs font-medium text-slate-500">Avaliação da equipe</label>
            <StarRatingInput v-model="tr.rating" />
          </div>
          <Textarea
            v-model="tr.notes"
            :rows="3"
            placeholder="Como foi a performance da equipe? O que melhorar?"
            class="mb-4"
          />
          <div class="flex items-center justify-end gap-2">
            <button
              v-if="tr.saved"
              class="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              @click="tr.editing = false"
            >
              Cancelar
            </button>
            <button
              :disabled="tr.saving || !tr.rating"
              class="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
              @click="saveTeamReport(tr)"
            >
              <BaseIcon name="Check" class="!size-3.5" />
              {{ tr.saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <ScaleObservation />
    <ScaleAttachment />
    <FeedbackForm />
  </section>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Tab from '@/components/tab/Tab';
import Empty from '@/components/empty/Empty';
import Textarea from '@/components/form/Textarea';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import ScaleHeader from '@/modules/calendar/components/scaleReport/ScaleHeader';
import ScaleObservation from '@/modules/calendar/components/scale/Observation';
import ScaleAttachment from '@/modules/calendar/components/scale/Attachment';
import FeedbackForm from '@/components/feedback/Feedback';
import StarRatingInput from '@/components/rating/StarRatingInput';

import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useScaleStore } from '@/modules/calendar/store/scale';
import { useAuthStore } from '@/modules/auth/store';
import { useFeedbackStore } from '@/components/feedback/store';

export default {
  components: { BaseIcon, ScaleHeader, Tab, Empty, Textarea, SkeletonRows, ScaleObservation, ScaleAttachment, FeedbackForm, StarRatingInput },

  data() {
    return {
      loadingScales: false,
      loadingTeamReports: false,
      teamReports: [],     // { teamId, teamName, reportId, rating, notes, saved, editing, saving }
      allTeamReports: [],  // admin: todos os relatórios
      workerFeedbacks: [],
      attendanceOptions: [
        { value: 'present',      icon: 'Check',  label: 'Presente',  activeClass: 'bg-green-500 text-white' },
        { value: 'late',         icon: 'Clock',  label: 'Atrasado',  activeClass: 'bg-yellow-400 text-white' },
        { value: 'absent',       icon: 'XMark',  label: 'Faltou',    activeClass: 'bg-red-500 text-white' }
      ],
      quickRateOptions: [
        { rating: 5, label: 'Bom',     dotClass: 'bg-green-500' },
        { rating: 3, label: 'Regular', dotClass: 'bg-amber-400' },
        { rating: 1, label: 'Ruim',    dotClass: 'bg-red-500' }
      ],
      openMenuId: null
    };
  },

  computed: {
    eventDayStore: () => useEventDayStore(),
    scaleStore: () => useScaleStore(),
    authStore: () => useAuthStore(),
    feedbackStore: () => useFeedbackStore(),

    hourTabs() {
      return this.eventDayStore?.eventDay?.eventHours?.map(hour => ({
        name: `${hour.startTime} às ${hour.endTime}`,
        key: hour.id,
        icon: 'clock',
        hour
      }));
    },

    pendingTeamReportsCount() {
      return this.teamReports.filter(tr => !tr.saved).length;
    },

    reportsByTeam() {
      const map = new Map();
      for (const r of this.allTeamReports) {
        if (!map.has(r.teamId)) map.set(r.teamId, { teamId: r.teamId, teamName: r.teamName, reports: [] });
        map.get(r.teamId).reports.push(r);
      }
      return Array.from(map.values());
    }
  },

  async mounted() {
    const firstHour = this.eventDayStore?.eventDay?.eventHours?.[0];
    await Promise.all([
      this.loadWorkerFeedbacks(),
      firstHour ? this.fetchScales(firstHour) : Promise.resolve()
    ]);
    if (firstHour) this.scaleStore.setHour(firstHour);
    await this.loadTeamReports(); // após scales para ter teamId + teamName
    document.addEventListener('click', this.closeMenu);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
  },

  methods: {
    toggleMenu(id) {
      this.openMenuId = this.openMenuId === id ? null : id;
    },

    closeMenu() {
      this.openMenuId = null;
    },
    async onTabChange(tab) {
      this.scaleStore.setHour(tab.hour);
      this.scaleStore.setTeam({});
      this.scaleStore.clearScale();
      await this.fetchScales(tab.hour);
    },

    async fetchScales(hour) {
      this.loadingScales = true;
      try {
        const response = await this.axios.get(
          `/schedule_items/${this.eventDayStore.eventDay?.event?.id}/schedules/${hour.id}/scales`
        );
        this.scaleStore.setReports(response);
      } finally {
        this.loadingScales = false;
      }
    },

    async loadWorkerFeedbacks() {
      if (!this.$can.canAccess('operator')) return;
      const id = this.eventDayStore.eventDay?.id;
      if (!id) return;
      try {
        this.workerFeedbacks = await this.axios.get(`/event_day/${id}/feedbacks`);
      } catch { /* sem feedbacks ainda */ }
    },

    async loadTeamReports() {
      const id = this.eventDayStore.eventDay?.id;
      if (!id || !this.$can.canAccess('operator')) return;
      this.loadingTeamReports = true;
      try {
        const response = await this.axios.get(`/event_day/${id}/team_reports`);
        const list           = response?.reports        ?? [];
        const requiredTeams  = response?.requiredTeams  ?? [];

        if (this.$can.canAccess('admin')) {
          this.allTeamReports = list;
        }

        // Apenas equipes que tiveram colaboradores escalados (fonte: backend)
        this.teamReports = requiredTeams.map(team => {
          const report = list.find(r =>
            String(r.teamId) === String(team.id) &&
            String(r.operatorId) === String(this.authStore.user?.id)
          );
          return {
            teamId:   team.id,
            teamName: team.name,
            reportId: report?.id ?? null,
            rating:   report?.rating ?? 0,
            notes:    report?.notes ?? '',
            saved:    !!report,
            editing:  !report,
            saving:   false
          };
        });
      } catch (e) {
        console.error('loadTeamReports:', e);
      } finally {
        this.loadingTeamReports = false;
      }
    },

    async saveTeamReport(tr) {
      const eventDayId = this.eventDayStore.eventDay?.id;
      if (!eventDayId || tr.saving) return;
      tr.saving = true;
      try {
        let result;
        if (tr.reportId) {
          result = await this.axios.patch(
            `/event_day/${eventDayId}/team_reports/${tr.reportId}`,
            { team_report: { rating: tr.rating, notes: tr.notes } }
          );
        } else {
          result = await this.axios.post(
            `/event_day/${eventDayId}/team_reports`,
            { team_report: { team_id: tr.teamId, rating: tr.rating, notes: tr.notes } }
          );
          tr.reportId = result?.id ?? null;
        }
        tr.saved = true;
        tr.editing = false;

        // Quando todos os relatórios estiverem preenchidos, marca e volta para a lista
        if (this.pendingTeamReportsCount === 0) {
          const avg = this.teamReports.reduce((s, r) => s + (r.rating || 0), 0) / this.teamReports.length;
          this.eventDayStore.markReportFilled(eventDayId, Math.round(avg));
          this.$router.replace({ path: '/calendar', query: { tab: 'history' } });
        }
      } catch (e) {
        console.error(e);
      } finally {
        tr.saving = false;
      }
    },

    async setAttendance(user, value) {
      const previous = user.attendance;
      user.attendance = value;
      try {
        await this.axios.patch(`/schedule_items/${user.scheduleItemId}/attendance`, { attendance: value });
      } catch {
        user.attendance = previous;
      }
    },

    scheduleStatus(status) {
      return {
        pending:     { color: 'bg-orange-100 text-orange-700', text: 'Não respondeu' },
        blocked:     { color: 'bg-red-100 text-red-700',       text: 'Ausência' },
        accepted:    { color: 'bg-green-100 text-green-700',   text: 'Aceita' },
        declined:    { color: 'bg-red-100 text-red-700',       text: 'Recusada' },
        rescheduled: { color: 'bg-slate-100 text-slate-700',   text: 'Trocada' }
      }[status];
    },

    async quickRate(user, rating) {
      if (user.quickRating) return;
      user.quickRating = true;
      try {
        await this.axios.post('/feedbacks', {
          feedback: {
            rating,
            comment: null,
            visibility: 'private',
            userId: user.id,
            scheduleItemId: user.scheduleItemId
          }
        });
        user.evaluated = true;
        user.rating = rating;
      } catch (err) {
        console.error(err?.response?.data?.errors || err.message);
      } finally {
        user.quickRating = false;
      }
    },

    openFeedback(user) {
      this.feedbackStore.setUserId(user.id);
      this.feedbackStore.setScheduleItemId(user.scheduleItemId);

      this.drawerStore.setDrawer({
        title: `Avaliar: ${user.name}`,
        context: 'feedback',
        open: true,
        onSave: async () => {
          await this.fetchScales(this.scaleStore.current?.hour);
          this.drawerStore.close();
        }
      });
    }
  }
};
</script>


