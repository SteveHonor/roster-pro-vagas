<template>
  <Card class="mb-10 w-full !min-h-0">
    <!-- Step indicator -->
    <div class="mb-8 flex items-center">
      <div class="flex items-center gap-2">
        <div
          :class="[
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            step === 1 ? 'bg-slate-900 text-white' : 'bg-green-500 text-white'
          ]"
        >
          <BaseIcon v-if="step > 1" name="Check" class="!size-3.5" />
          <span v-else>1</span>
        </div>
        <span :class="['text-sm font-semibold', step === 1 ? 'text-slate-900' : 'text-slate-400']">Configuração</span>
      </div>
      <div class="mx-4 h-px flex-1 bg-slate-200" />
      <div class="flex items-center gap-2">
        <div
          :class="[
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
          ]"
        >2</div>
        <span :class="['text-sm font-semibold', step === 2 ? 'text-slate-900' : 'text-slate-400']">Dias & Horários</span>
      </div>
    </div>

    <!-- ───────────────────────────────────── -->
    <!-- STEP 1: Configuração                  -->
    <!-- ───────────────────────────────────── -->
    <div v-if="step === 1">
      <!-- Informações básicas -->
      <div class="mb-5 flex flex-wrap items-start gap-6 md:flex-nowrap">
        <div class="w-full md:w-9/12">
          <FormInput
            v-model="eventStore.event.name"
            label="Nome da agenda *"
            placeholder="Ex: Trabalho voluntário em SP"
          />
          <span v-if="v$.eventStore.event.name.$error" class="text-sm text-red-500">
            Nome é obrigatório
          </span>
        </div>

        <FormSelect
          v-model="eventStore.event.eventType"
          label="Tipo da agenda"
          :options="eventTypes"
          class="w-full md:w-3/12"
        />
      </div>

      <!-- Local / Link -->
      <div class="mb-6 flex flex-wrap items-start gap-6 md:flex-nowrap">
        <div v-if="['place', 'hybrid'].includes(eventStore.event.eventType)" class="w-full md:w-4/12">
          <FormInput
            v-model="eventStore.event.placeName"
            label="Nome do local *"
            icon="Pin"
            placeholder="Nome do local"
          />
          <span v-if="v$.eventStore.event.placeName.$error" class="text-sm text-red-500">
            Nome do local é obrigatório
          </span>
        </div>

        <div :class="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'w-full md:w-8/12' : 'w-full'">
          <FormInput
            v-model="eventStore.event.place"
            :label="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Endereço *' : 'Link da reunião *'"
            :placeholder="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Rua, número, bairro...' : 'https://meet.google.com/...'"
            :icon="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Pin' : 'Play'"
          />
          <span v-if="v$.eventStore.event.place.$error" class="text-sm text-red-500">
            {{ ['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Local é obrigatório' : 'Link é obrigatório' }}
          </span>
        </div>
      </div>

      <!-- Configurações de escala -->
      <div class="mb-6">
        <p class="mb-3 text-sm font-semibold text-slate-800">Configuração da escala</p>

        <!-- Grupo: Escala -->
        <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Escala</p>
          <div class="flex flex-wrap gap-4 md:flex-nowrap">
            <div class="w-full sm:w-auto">
              <label class="mb-1 block text-sm font-medium text-gray-800">Tipo de Escala</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition"
                  :class="eventStore.event.configuration.type === 'voluntary'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                  @click="eventStore.event.configuration.type = 'voluntary'"
                >
                  Voluntária
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition"
                  :class="$can.canView('paidScales')
                    ? (eventStore.event.configuration.type === 'paid'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')
                    : 'cursor-pointer border-slate-200 bg-slate-50 text-slate-400'"
                  @click="$can.canView('paidScales')
                    ? (eventStore.event.configuration.type = 'paid')
                    : planStore.setOpen('upgrade')"
                >
                  <BaseIcon
                    v-if="!$can.canView('paidScales')"
                    name="LockClosed"
                    class="!size-3.5 flex-shrink-0"
                  />
                  Remunerada
                </button>
              </div>
              <p v-if="!$can.canView('paidScales')" class="mt-1.5 text-xs text-slate-400">
                Controle pagamentos por colaborador.
                <button type="button" class="font-medium text-orange-500 hover:underline" @click="planStore.setOpen('upgrade')">
                  Fazer upgrade <BaseIcon name="ChevronRight" class="inline !h-3 !w-3" />
                </button>
              </p>
            </div>

            <FormSelect
              v-model="eventStore.event.configuration.refuse"
              label="Podem recusar?"
              :options="refuseOptions"
              class="w-full md:w-3/12"
            />

            <FormSelect
              v-model="eventStore.event.format"
              label="Formato"
              :options="formats"
              class="w-full md:w-3/12"
              @change="() => eventStore.resetEventSchedule()"
            />

            <FormSelect
              v-model="eventStore.event.configuration.repeat"
              label="Repetir em outros meses"
              :options="repeatOptions"
              class="w-full md:w-3/12"
              @change="() => eventStore.setMonth(parseInt(eventStore.event.month) + 1)"
            />
          </div>

          <div v-if="eventStore.event.configuration.type === 'paid'" class="mt-4 border-t border-slate-200 pt-4">
            <FormInput
              v-model="eventStore.event.configuration.payment_rate_cents"
              label="Valor padrão por turno"
              placeholder="R$ 0,00"
              hint="Valor padrão para todos os escalados. Pode ser ajustado individualmente na tela de Pagamentos."
              :currency="true"
            />
          </div>
        </div>

        <!-- Grupo: Notificações & Visibilidade -->
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Notificações & Visibilidade</p>
          <div class="flex flex-wrap gap-4 md:flex-nowrap">
            <FormSelect
              v-model="eventStore.event.configuration.feedback"
              label="Gestão de Avaliação"
              :options="feedbackOptions"
              class="w-full md:w-3/12"
            />

            <FormSelect
              v-model="eventStore.event.configuration.reminder"
              label="Lembrar Equipe"
              :options="reminderOptions"
              class="w-full md:w-3/12"
            />

            <FormSelect
              v-model="eventStore.event.configuration.observation"
              label="Observações visíveis para"
              :options="observationOptions"
              class="w-full md:w-3/12"
            />

            <FormSelect
              v-model="eventStore.event.configuration.attachment"
              label="Anexos visíveis para"
              :options="attachmentOptions"
              class="w-full md:w-3/12"
            />
          </div>
        </div>
      </div>

      <!-- Ações step 1 -->
      <div class="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          @click="$router.back()"
        >
          Voltar
        </button>
        <BaseButton icon="ChevronRight" @click="nextStep">
          Próximo
        </BaseButton>
      </div>
    </div>

    <!-- ───────────────────────────────────── -->
    <!-- STEP 2: Dias & Horários               -->
    <!-- ───────────────────────────────────── -->
    <div v-if="step === 2">
      <!-- Navegador de mês (integrado ao calendário) -->
      <div v-if="eventStore.event.format !== 'custom'" class="mb-6 flex w-full items-center justify-between gap-4">
        <button
          type="button"
          :disabled="!canGoPrev"
          :class="['flex w-40 justify-center rounded bg-gray-50 py-3 text-sm font-medium text-gray-500 shadow transition', canGoPrev ? 'hover:bg-gray-100' : 'cursor-not-allowed opacity-40']"
          @click="prevMonth"
        >
          {{ prevMonthLabel }}
        </button>
        <span class="w-full rounded border bg-white px-3 py-2 text-center font-bold text-gray-600">
          {{ currentMonthLabel }} {{ eventStore.event.year }}
        </span>
        <button
          type="button"
          :disabled="!canGoNext"
          :class="['flex w-40 justify-center rounded bg-gray-50 py-3 text-sm font-medium text-gray-500 shadow transition', canGoNext ? 'hover:bg-gray-100' : 'cursor-not-allowed opacity-40']"
          @click="nextMonth"
        >
          {{ nextMonthLabel }}
        </button>
      </div>

      <!-- Seleção de dias por formato -->
      <div v-if="eventStore.event.format === 'daily'" class="my-5">
        <DailyDays ref="month" :selected-month="Number(eventStore.event.month)" />
        <DailyHours type="day" />
      </div>

      <div v-if="eventStore.event.format === 'weekly'" class="my-5">
        <WeekDays :selected-month="Number(eventStore.event.month)" />
        <DailyHours type="week" />
      </div>

      <div v-if="eventStore.event.format === 'custom'" class="my-5">
        <CustomDays ref="month" :selected-month="Number(eventStore.event.month)" />
        <DailyHours type="custom" />
      </div>

      <!-- Erro: sem dias selecionados -->
      <div v-if="noDaysError" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
        Selecione ao menos um dia antes de publicar.
      </div>

      <!-- Recorrência: seleção de meses -->
      <div v-if="eventStore.getDaysChosen.length && eventStore.event.configuration.repeat === 'true'" class="my-5">
        <template v-if="$can.canView('recurrence')">
          <p class="mb-2 text-sm font-medium text-slate-700">
            Repetir nos meses de {{ moment().year() }}
          </p>
          <div class="mt-1 flex flex-wrap gap-2">
            <button
              v-for="month in months"
              :key="month.value"
              class="flex h-10 min-w-[60px] items-center justify-center rounded-lg border text-sm font-semibold transition"
              :class="[
                eventStore.getMonthsChosen.includes(month.value) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700',
                eventStore.event.month >= month.value ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-slate-400'
              ]"
              :disabled="month.disabled"
              @click="() => {
                if (month.disabled) return;
                eventStore.getMonthsChosen.includes(month.value)
                  ? eventStore.unsetMonth(month.value)
                  : eventStore.setMonth(month.value);
              }"
            >
              {{ month.label.slice(0, 3) }}
            </button>
          </div>
        </template>
        <template v-else>
          <button
            type="button"
            class="mt-1 flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700 transition hover:bg-amber-100"
            @click="planStore.setOpen('upgrade')"
          >
            <BaseIcon name="LockClosed" class="h-4 w-4 flex-shrink-0 text-amber-500" />
            <span><strong class="font-semibold">Recorrência multi-mês</strong> está disponível nos planos pagos. <span class="underline">Ver planos</span></span>
          </button>
        </template>
      </div>

      <!-- Observações -->
      <div class="my-5 w-full">
        <label class="text-sm font-medium text-slate-700">Observações</label>
        <textarea
          v-model="eventStore.event.observation"
          placeholder="Escreva aqui observações adicionais sobre a agenda..."
          class="mt-1 w-full appearance-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          rows="5"
        ></textarea>
      </div>

      <!-- Anexos -->
      <div class="my-5 w-full">
        <label class="text-sm font-medium text-slate-700">Anexos</label>
        <div
          class="mt-1 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:bg-slate-100 cursor-pointer"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFile"
        >
          <BaseIcon name="Upload" class="!size-8 text-slate-400" />
          <p class="text-sm text-slate-500">{{ uploading ? 'Enviando arquivos…' : 'Arraste e solte ou clique para selecionar arquivos' }}</p>
          <p class="text-xs text-slate-400">Imagens, documentos e PDFs (máx. 10MB cada)</p>
        </div>

        <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileChange" />

        <div v-if="files.length" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="relative rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow"
          >
            <div class="mb-2 flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50">
              <img v-if="isImage(file.name)" :src="previews[index]" class="max-h-full object-contain" alt="preview" />
              <BaseIcon v-else name="DocumentText" class="!size-8 text-slate-400" />
            </div>
            <div class="truncate text-center text-xs text-slate-600">{{ file.name }}</div>
            <button class="absolute right-1.5 top-1.5 rounded-full bg-white p-1.5 shadow-sm hover:bg-red-50" @click.stop="removeFile(index)">
              <BaseIcon name="Trash" class="!size-3.5 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <!-- Ações step 2 -->
      <div class="mt-12 flex w-full items-center justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          @click="goBack"
        >
          Voltar
        </button>
        <BaseButton icon="Play" @click="save()">
          Publicar Agenda
        </BaseButton>
      </div>
    </div>
  </Card>
</template>

<script>
import BaseButton from '@/components/base/Button';
import FormInput from '@/components/form/Input';
import FormSelect from '@/components/form/Select';
import Card from '@/components/card/Card';
import WeekDays from '@/modules/calendar/components/schedule/weekly/Days';
import CustomDays from '@/modules/calendar/components/schedule/custom/Days';
import DailyDays from '@/modules/calendar/components/schedule/daily/Days';
import DailyHours from '@/modules/calendar/components/schedule/Hours';
import BaseIcon from '@/components/icons/BaseIcon';

import useVuelidate from '@vuelidate/core/index.js';
import { required, requiredIf } from '@vuelidate/validators/index.js';
import { track, EVENTS } from '@/analytics';

import { useEventStore } from '@/modules/calendar/store/event';
import { useCompanyStore } from '@/modules/users/store/company';
import { usePlanStore } from '@/components/plan/store';
import { useOnboardingStore } from '@/components/onboarding/store';

export default {
  components: {
    BaseButton,
    FormInput,
    FormSelect,
    DailyDays,
    DailyHours,
    BaseIcon,
    WeekDays,
    CustomDays,
    Card
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      step: 1,
      files: [],
      previews: [],
      uploading: false,
      noDaysError: false
    };
  },
  validations() {
    return {
      eventStore: {
        event: {
          name: { required },
          place: { required },
          placeName: {
            required: requiredIf(function () {
              return ['place', 'hybrid'].includes(this.eventStore.event.eventType);
            })
          },
          format: { required },
          month: { required },
          configuration: {
            type: { required }
          }
        }
      }
    };
  },
  computed: {
    eventStore: () => useEventStore(),
    companyStore: () => useCompanyStore(),
    planStore: () => usePlanStore(),
    onboardingStore: () => useOnboardingStore(),
    currentMonth: self => self.moment().month() + 1,
    months() {
      return [
        { value: 1, label: 'Janeiro' },
        { value: 2, label: 'Fevereiro' },
        { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Maio' },
        { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' },
        { value: 11, label: 'Novembro' },
        { value: 12, label: 'Dezembro' }
      ].map(m => ({ ...m, disabled: m.value < this.currentMonth }));
    },
    eventTypes() {
      return [
        { value: 'place', label: 'Presencial' },
        { value: 'remote', label: 'Remoto' }
      ];
    },
    formats() {
      return [
        { value: 'daily', label: 'Diária' },
        { value: 'weekly', label: 'Semanal' },
        { value: 'custom', label: 'Personalizada' }
      ];
    },
    reminderOptions() {
      return [...Array(8)].map((_, i) => ({
        value: i,
        label: i === 0 ? 'No dia do evento' : `${i} dia${i > 1 ? 's' : ''} antes`
      }));
    },
    feedbackOptions() {
      return [{ value: true, label: 'Sim' }, { value: false, label: 'Não' }];
    },
    refuseOptions() {
      return [{ value: true, label: 'Sim' }, { value: false, label: 'Não' }];
    },
    observationOptions() {
      return [
        { value: 'all', label: 'Todos' },
        { value: 'user', label: 'Colaborador' },
        { value: 'operator', label: 'Operador' }
      ];
    },
    attachmentOptions() {
      return [
        { value: 'all', label: 'Todos' },
        { value: 'user', label: 'Colaborador' },
        { value: 'operator', label: 'Operador' }
      ];
    },
    repeatOptions() {
      return [{ value: true, label: 'Sim' }, { value: false, label: 'Não' }];
    },
    currentMonthLabel() {
      return this.months.find(m => m.value === this.eventStore.event.month)?.label || '';
    },
    prevMonthLabel() {
      const idx = this.eventStore.event.month - 2;
      return idx >= 0 ? this.months[idx].label : '';
    },
    nextMonthLabel() {
      const idx = this.eventStore.event.month;
      return idx <= 11 ? this.months[idx].label : '';
    },
    canGoPrev() {
      return this.eventStore.event.month > this.currentMonth;
    },
    canGoNext() {
      return this.eventStore.event.month < 12;
    }
  },
  created() {
    this.eventStore.resetEvent();
  },
  beforeUnmount() {
    this.previews.forEach(url => { if (url) URL.revokeObjectURL(url); });
  },
  mounted() {
    if (!this.$can.canCreate('events')) {
      this.planStore.setOpen('limit');
    }

    if (['place', 'hybrid'].includes(this.eventStore.event.eventType)) {
      if (this.companyStore.getChosenCompany.street) {
        this.eventStore.event.place = `${this.companyStore.getChosenCompany.street}, ${this.companyStore.getChosenCompany.number} - ${this.companyStore.getChosenCompany.neighborhood} ${this.companyStore.getChosenCompany.city} - ${this.companyStore.getChosenCompany.state}`;
      }
    }
  },
  methods: {
    prevMonth() {
      if (!this.canGoPrev) return;
      this.eventStore.event.month -= 1;
      this.updateDays();
    },
    nextMonth() {
      if (!this.canGoNext) return;
      this.eventStore.event.month += 1;
      this.updateDays();
    },
    async nextStep() {
      const result = await this.v$.$validate();
      if (result) {
        this.step = 2;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    goBack() {
      this.step = 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async save() {
      this.noDaysError = false;

      if (this.eventStore.getDaysChosen.length === 0) {
        this.noDaysError = true;
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      }

      if (this.eventStore.hasError) return;

      this.confirmationStore.setConfirmation({
        title: 'Publicar Agenda',
        description: 'Confirma a publicação desta agenda?',
        open: true,
        onConfirm: async () => {
          try {
            this.uploading = true;
            const attachmentUrls = await this.uploadFiles();

            const payload = {
              event: {
                name:              this.eventStore.event.name,
                eventType:         this.eventStore.event.eventType,
                place:             this.eventStore.event.place,
                year:              this.eventStore.event.year,
                month:             this.eventStore.event.month,
                format:            this.eventStore.event.format,
                placeName:         this.eventStore.event.placeName,
                recurrenceMonths:  JSON.stringify(this.eventStore.getMonthsChosen),
                observation:       this.eventStore.event.observation,
                schedule:          JSON.stringify(this.eventStore.event.schedule),
                attachmentUrls,
                configuration: {
                  type:        this.eventStore.event.configuration.type,
                  reminder:    this.eventStore.event.configuration.reminder,
                  feedback:    this.eventStore.event.configuration.feedback,
                  refuse:      this.eventStore.event.configuration.refuse,
                  observation: this.eventStore.event.configuration.observation,
                  attachment:  this.eventStore.event.configuration.attachment
                }
              }
            };

            const response = await this.axios.post('/events', payload);
            track(EVENTS.EVENT_CREATED, { recurrence: this.eventStore.event.recurrence });
            this.onboardingStore.setScheduleCreated();
            this.confirmationStore.close();

            if (response?.limit_reached) {
              this.planStore.setOpen('limit');
            }

            const firstId = response?.first_event_day_id;
            if (firstId) {
              this.$router.replace(`/calendar/${firstId}/scale`);
            } else {
              this.$router.replace({ path: '/calendar', query: { tab: 'events' } });
            }
          } catch (error) {
            console.error('Erro ao criar evento:', error);
            this.confirmationStore.close();
          } finally {
            this.uploading = false;
          }
        }
      });
    },
    async uploadFiles() {
      const urls = [];
      for (const file of this.files) {
        const { uploadUrl, publicUrl } = await this.axios.post('/storage/presign', {
          filename:     file.name,
          content_type: file.type,
          byte_size:    file.size
        });
        await fetch(uploadUrl, {
          method:  'PUT',
          body:    file,
          headers: { 'Content-Type': file.type }
        });
        urls.push(publicUrl);
      }
      return urls;
    },
    handleDrop(event) {
      const newFiles = [...event.dataTransfer.files];
      newFiles.forEach(f => this.previews.push(this.isImage(f.name) ? URL.createObjectURL(f) : null));
      this.files.push(...newFiles);
    },
    handleFileChange(event) {
      const newFiles = [...event.target.files];
      newFiles.forEach(f => this.previews.push(this.isImage(f.name) ? URL.createObjectURL(f) : null));
      this.files.push(...newFiles);
    },
    removeFile(index) {
      if (this.previews[index]) URL.revokeObjectURL(this.previews[index]);
      this.files.splice(index, 1);
      this.previews.splice(index, 1);
    },
    triggerFile() {
      this.$refs.fileInput.click();
    },
    isImage(name) {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
    },
    updateDays() {
      if (this.eventStore.event.format === 'daily') {
        this.$refs.month?.updateDays();
      }
      this.eventStore.resetEventSchedule();
    }
  }
};
</script>
