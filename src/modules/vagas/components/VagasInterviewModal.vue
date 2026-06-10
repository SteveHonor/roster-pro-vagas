<template>
  <Modal :open="open">
    <div class="w-full rounded-md bg-white shadow-xl sm:max-w-md">

      <!-- Estado de sucesso -->
      <div v-if="success" class="flex flex-col items-center gap-3 px-8 py-10 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <BaseIcon name="CheckCircle" class="!size-6 text-emerald-600" />
        </div>
        <p class="text-base font-semibold text-slate-800">Entrevista agendada!</p>
        <p class="text-sm text-slate-500">Email de confirmação enviado ao candidato.</p>
        <button
          type="button"
          class="mt-2 rounded-md bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          @click="closeAndReset"
        >
          Fechar
        </button>
      </div>

      <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 class="font-semibold text-slate-800">Agendar entrevista</h3>
        <button type="button" class="text-slate-400 hover:text-slate-600" @click="$emit('close')">
          <BaseIcon name="XMark" class="!size-5" />
        </button>
      </div>

      <!-- Corpo -->
      <div class="space-y-4 px-5 py-4">
        <!-- Data e hora -->
        <div class="grid grid-cols-2 gap-3">
          <FormInput v-model="form.scheduledAt" label="Data e hora" type="datetime-local" />
          <FormSelect
            v-model="form.durationMinutes"
            label="Duração"
            :options="durationOptions"
          />
        </div>

        <!-- Modalidade -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Formato</label>
          <div class="flex gap-2">
            <button
              v-for="opt in modalityOptions"
              :key="opt.value"
              type="button"
              class="flex-1 rounded-md border px-3 py-2 text-xs font-medium transition"
              :class="form.modality === opt.value
                ? 'border-slate-700 bg-slate-800 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
              @click="form.modality = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Link da reunião (só vídeo) -->
        <FormInput
          v-if="form.modality === 'video'"
          v-model="form.meetingLink"
          label="Link da reunião"
          placeholder="https://meet.google.com/..."
          icon="LinkedIn"
        />
      </div>

      <!-- Rodapé -->
      <div class="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <BaseButton :loading="saving" @click="submit">
          Agendar
        </BaseButton>
      </div>
      </template>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/modal/Modal';
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import FormInput from '@/components/form/Input';
import FormSelect from '@/components/form/Select';
import vagasService from '@/services/vagas';

export default {
  components: { Modal, BaseButton, BaseIcon, FormInput, FormSelect },

  props: {
    open: { type: Boolean, default: false },
    applicationId: { type: [String, Number], default: null }
  },

  emits: ['close', 'created'],

  data() {
    return {
      saving: false,
      success: false,
      form: {
        scheduledAt: '',
        durationMinutes: 60,
        modality: 'video',
        meetingLink: ''
      },
      durationOptions: [
        { label: '30 minutos', value: 30 },
        { label: '45 minutos', value: 45 },
        { label: '1 hora', value: 60 },
        { label: '1h 30min', value: 90 },
        { label: '2 horas', value: 120 }
      ],
      modalityOptions: [
        { value: 'video', label: 'Vídeo' },
        { value: 'phone', label: 'Telefone' },
        { value: 'in_person', label: 'Presencial' }
      ]
    };
  },

  methods: {
    async submit() {
      this.saving = true;
      try {
        const interview = await vagasService.createInterview({
          ...this.form,
          applicationId: this.applicationId
        });
        this.$emit('created', interview);
        this.success = true;
      } catch (error) {
        console.error(error);
      } finally {
        this.saving = false;
      }
    },

    closeAndReset() {
      this.success = false;
      this.form = { scheduledAt: '', durationMinutes: 60, modality: 'video', meetingLink: '' };
      this.$emit('close');
    }
  }
};
</script>
