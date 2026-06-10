<template>
  <Modal :open="open">
    <div class="w-full rounded-md bg-white shadow-xl sm:max-w-lg">

      <!-- Estado de sucesso -->
      <div v-if="success" class="flex flex-col items-center gap-3 px-8 py-10 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <BaseIcon name="CheckCircle" class="!size-6 text-emerald-600" />
        </div>
        <p class="text-base font-semibold text-slate-800">
          {{ successMessage }}
        </p>
        <p v-if="lastAction === 'send'" class="text-sm text-slate-500">Email com os detalhes da proposta e botões de aceitar/recusar foi enviado ao candidato.</p>
        <p v-else class="text-sm text-slate-500">Você pode enviá-la na página Agenda.</p>
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
        <h3 class="font-semibold text-slate-800">Enviar proposta</h3>
        <button type="button" class="text-slate-400 hover:text-slate-600" @click="$emit('close')">
          <BaseIcon name="XMark" class="!size-5" />
        </button>
      </div>

      <!-- Corpo -->
      <div class="space-y-4 px-5 py-4">
        <div class="grid grid-cols-2 gap-3">
          <FormInput v-model="form.salary" label="Salário (R$)" :currency="true" />
          <FormInput v-model="form.startDate" label="Data de início" type="date" />
        </div>

        <FormTextarea
          v-model="form.benefits"
          label="Benefícios"
          placeholder="Liste os benefícios oferecidos..."
          :rows="3"
        />

        <FormTextarea
          v-model="form.message"
          label="Mensagem personalizada"
          placeholder="Escreva uma mensagem de boas-vindas para o candidato..."
          :rows="4"
        />

        <FormInput v-model="form.expiresAt" label="Proposta válida até" type="date" />

        <!-- Preview -->
        <div v-if="form.salary || form.message" class="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Preview da proposta</p>
          <div class="space-y-1 text-xs text-slate-600">
            <p v-if="form.salary">
              <span class="font-medium">Salário:</span>
              {{ salaryFormatted }}
            </p>
            <p v-if="form.startDate">
              <span class="font-medium">Início:</span>
              {{ formatDate(form.startDate) }}
            </p>
            <p v-if="form.expiresAt">
              <span class="font-medium">Válida até:</span>
              {{ formatDate(form.expiresAt) }}
            </p>
            <p v-if="form.message" class="mt-2 italic text-slate-500">"{{ form.message }}"</p>
          </div>
        </div>
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
        <button
          type="button"
          class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          :disabled="saving"
          @click="submit('draft')"
        >
          Salvar rascunho
        </button>
        <BaseButton :loading="saving && sendAction === 'send'" @click="submit('send')">
          Enviar proposta
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
import FormTextarea from '@/components/form/Textarea';
import vagasService from '@/services/vagas';
import { formatCurrencyCents, formatDate as fmtDate } from '@/utils/format';

export default {
  components: { Modal, BaseButton, BaseIcon, FormInput, FormTextarea },

  props: {
    open: { type: Boolean, default: false },
    applicationId: { type: [String, Number], default: null }
  },

  emits: ['close', 'created'],

  data() {
    return {
      saving: false,
      sendAction: null,
      success: false,
      lastAction: null,
      form: {
        salary: null,
        startDate: '',
        benefits: '',
        message: '',
        expiresAt: ''
      }
    };
  },

  computed: {
    salaryFormatted() {
      return this.form.salary ? formatCurrencyCents(this.form.salary) : '';
    },
    successMessage() {
      return this.lastAction === 'send' ? 'Proposta enviada!' : 'Rascunho salvo!';
    }
  },

  methods: {
    formatDate(dateStr) {
      return fmtDate(dateStr) || '';
    },

    async submit(action) {
      this.saving = true;
      this.sendAction = action;
      try {
        const offer = await vagasService.createOffer({
          ...this.form,
          applicationId: this.applicationId
        });
        if (action === 'send' && offer?.id) {
          await vagasService.sendOffer(offer.id);
        }
        this.$emit('created', offer);
        this.lastAction = action;
        this.success = true;
      } catch (error) {
        console.error(error);
      } finally {
        this.saving = false;
        this.sendAction = null;
      }
    },

    closeAndReset() {
      this.success = false;
      this.lastAction = null;
      this.form = { salary: null, startDate: '', benefits: '', message: '', expiresAt: '' };
      this.$emit('close');
    }
  }
};
</script>
