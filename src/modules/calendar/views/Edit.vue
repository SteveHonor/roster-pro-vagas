<template>
  <Drawer context="event" :on-save="submitForm" :on-close="() => {}">
    <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
      {{ error }}
    </div>

    <div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="md:col-span-3">
        <FormInput
          v-model="eventStore.event.name"
          label="Nome da agenda"
          placeholder="Ex: Trabalho voluntário em SP"
        />
        <span v-if="v$.eventStore.event.name.$error" class="text-sm text-red-500">
          Nome é obrigatório
        </span>
      </div>

      <FormSelect
        v-model="eventStore.event.eventType"
        label="Tipo"
        :options="eventTypes"
      />
    </div>

    <div class="mb-5">
      <FormInput
        v-model="eventStore.event.place"
        :label="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Defina o local' : 'Link da reunião'"
        :placeholder="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'Endereço do local' : 'Link da reunião'"
        :icon="['place', 'hybrid'].includes(eventStore.event.eventType) ? 'MapPin' : 'Link'"
      />
    </div>

    <div class="mb-2 text-sm font-medium text-slate-700">Configuração da escala</div>
    <div class="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <FormSelect
          v-model="eventStore.event.configuration.type"
          label="Tipo de Escala"
          :options="scaleTypes"
        />

        <FormSelect
          v-model="eventStore.event.configuration.refuse"
          label="Podem recusar?"
          :options="refuseOptions"
        />

        <FormSelect
          v-model="eventStore.event.configuration.feedback"
          label="Gestão de Avaliação"
          :options="feedbackOptions"
        />

        <FormSelect
          v-model="eventStore.event.configuration.reminder"
          label="Lembrar Equipe"
          :options="reminderOptions"
        />

        <FormSelect
          v-model="eventStore.event.configuration.observation"
          label="Ver observações?"
          :options="observationOptions"
          class="md:col-span-2"
        />

        <FormSelect
          v-model="eventStore.event.configuration.attachment"
          label="Ver anexos?"
          :options="attachmentOptions"
          class="md:col-span-2"
        />
      </div>

      <div v-if="eventStore.event.configuration.type === 'paid'" class="mt-4 border-t border-slate-200 pt-4">
        <FormInput
          v-model="eventStore.event.configuration.payment_rate_cents"
          label="Valor padrão por turno"
          placeholder="R$ 0,00"
          hint="Valor padrão para todos os escalados. Ajuste individual disponível em Pagamentos."
          :currency="true"
        />
      </div>
    </div>

    <div class="my-5 w-full">
      <label class="text-sm font-medium text-slate-700">Observações</label>
      <textarea
        v-model="eventStore.event.observation"
        placeholder="Observações adicionais sobre o evento..."
        class="mt-1 w-full appearance-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
        rows="4"
      ></textarea>
    </div>

    <!-- Zona de perigo -->
    <div class="mt-8 border-t border-red-100 pt-5">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">Zona de perigo</p>
      <div class="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-red-700">Cancelar agenda completa</p>
          <p class="mt-0.5 text-xs text-red-500">Remove todas as datas desta agenda. Todos os escalados serão notificados.</p>
        </div>
        <button
          type="button"
          class="ml-4 flex-shrink-0 rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
          @click="cancelEvent"
        >
          Cancelar agenda
        </button>
      </div>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import FormInput from '@/components/form/Input';
import FormSelect from '@/components/form/Select';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useEventStore } from '@/modules/calendar/store/event';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

import useVuelidate from '@vuelidate/core/index.js';
import { required } from '@vuelidate/validators/index.js';

export default {
  components: {
    Drawer,
    FormInput,
    FormSelect
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      error: ''
    };
  },
  validations() {
    return {
      eventStore: {
        event: {
          name: { required }
        }
      }
    };
  },
  computed: {
    confirmationStore: () => useConfirmationStore(),
    eventStore: () => useEventStore(),
    eventDayStore: () => useEventDayStore(),
    eventTypes() {
      return [
        { value: 'place', label: 'Presencial' },
        { value: 'remote', label: 'Remoto' }
      ];
    },
    scaleTypes() {
      return [
        { value: 'voluntary', label: 'Voluntária' },
        { value: 'paid', label: 'Remunerada' }
      ];
    },
    reminderOptions() {
      return [...Array(8)].map((_, i) => ({
        value: i,
        label: i === 0 ? 'No dia do evento' : `${i} dia${i > 1 ? 's' : ''} antes`
      }));
    },
    feedbackOptions() {
      return [
        { value: true, label: 'Sim' },
        { value: false, label: 'Não' }
      ];
    },
    refuseOptions() {
      return [
        { value: true, label: 'Sim' },
        { value: false, label: 'Não' }
      ];
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
    }
  },
  methods: {
    cancelEvent() {
      this.confirmationStore.setConfirmation({
        title: 'Cancelar agenda completa?',
        description:
          '<p>Você está cancelando <strong>todas as datas</strong> desta agenda.</p>' +
          '<p class="italic my-2 text-gray-600">Todos os colaboradores escalados serão notificados de acordo com suas preferências de notificação.</p>' +
          '<p class="mt-3 text-red-500 text-sm font-medium">Essa ação é irreversível.</p>',
        open: true,
        onConfirm: async () => {
          try {
            const response = await this.axios.delete(`events/${this.eventStore.event.id}/cancel`);
            this.eventDayStore.setEventDays(response);
            this.confirmationStore.close();
            this.drawerStore.close();
          } catch (err) {
            this.error = err?.response?.data?.error || 'Erro ao cancelar agenda.';
            this.confirmationStore.close();
          }
        }
      });
    },

    async submitForm() {
      this.error = '';
      const result = await this.v$.$validate();
      if (!result) return;

      const eventDayId = this.eventDayStore.eventDay.id;
      if (!eventDayId) {
        this.error = 'Não foi possível identificar o evento.';
        return;
      }

      await this.axios
        .patch(`/events/${eventDayId}`, {
          event: {
            name: this.eventStore.event.name,
            event_type: this.eventStore.event.eventType,
            place: this.eventStore.event.place,
            place_name: this.eventStore.event.placeName,
            observation: this.eventStore.event.observation,
            configuration: {
              type: this.eventStore.event.configuration.type,
              reminder: this.eventStore.event.configuration.reminder,
              feedback: this.eventStore.event.configuration.feedback,
              refuse: this.eventStore.event.configuration.refuse,
              observation: this.eventStore.event.configuration.observation,
              attachment: this.eventStore.event.configuration.attachment
            }
          }
        })
        .then(() => {
          this.drawerStore.close();
        })
        .catch(err => {
          this.error = err?.response?.data?.error || 'Erro ao salvar evento.';
        });
    }
  }
};
</script>
