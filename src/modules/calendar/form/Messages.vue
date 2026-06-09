<template>
  <Drawer
    context="form-messages"
    :on-save="submitForm"
    action-button-name="Enviar Comunicado"
    :on-close="resetForm"
    :disabled="!message.trim()"
  >
    <!-- Mensagem -->
    <div class="mb-5">
      <div class="mb-1 flex items-center justify-between">
        <label class="text-sm font-medium text-slate-700">Mensagem</label>
        <span :class="['text-xs', message.length > 450 ? 'text-amber-500' : 'text-slate-400']">
          {{ message.length }}/500
        </span>
      </div>
      <textarea
        v-model="message"
        rows="6"
        maxlength="500"
        placeholder="Ex: Lembrete — confirmem a escala do próximo domingo até sexta-feira."
        class="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
      />
    </div>

    <!-- Escopo do operador -->
    <div v-if="isOperatorOnly" class="mb-5 flex items-start gap-2.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3.5 py-3">
      <BaseIcon name="Shield" class="!size-4 mt-0.5 flex-shrink-0 text-indigo-400" />
      <div>
        <p class="text-xs font-semibold text-indigo-700">Escopo limitado às suas equipes</p>
        <p class="mt-0.5 text-xs text-indigo-500">Este comunicado será enviado apenas para os colaboradores das equipes que você gerencia.</p>
      </div>
    </div>

    <!-- Enviar para -->
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium text-slate-700">Enviar para</label>
      <div class="flex gap-2">
        <button
          v-for="opt in availableReceivers"
          :key="opt.value"
          type="button"
          :class="[
            'flex-1 rounded-md border py-2 text-sm font-medium transition',
            sentTo === opt.value
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          ]"
          @click="sentTo = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Exibir por -->
    <div class="mb-5">
      <label class="mb-2 block text-sm font-medium text-slate-700">Exibir por</label>
      <div class="flex gap-2">
        <button
          v-for="d in dayOptions"
          :key="d"
          type="button"
          :class="[
            'flex-1 rounded-md border py-2 text-sm font-medium transition',
            daysVisible === d
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          ]"
          @click="daysVisible = d"
        >
          {{ d }}d
        </button>
      </div>
      <p class="mt-2 text-xs text-slate-400">
        Visível no app por {{ daysVisible }} {{ daysVisible === 1 ? 'dia' : 'dias' }} após o envio.
      </p>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useMessageStore } from '@/modules/calendar/store/message';

export default {
  name: 'FormMessages',
  components: { Drawer, BaseIcon },
  data: () => ({
    message: '',
    daysVisible: 1,
    sentTo: 'user',
    dayOptions: [1, 3, 7, 14],
    receivers: [
      { label: 'Todos',         value: 'all'      },
      { label: 'Colaboradores', value: 'user'     },
      { label: 'Operadores',    value: 'operator' }
    ]
  }),
  computed: {
    messageStore: () => useMessageStore(),
    isOperatorOnly() {
      return this.$can.canAccess('operator') && !this.$can.canAccess('admin');
    },
    availableReceivers() {
      if (this.isOperatorOnly) {
        return [{ label: 'Colaboradores', value: 'user' }];
      }
      return this.receivers;
    }
  },
  methods: {
    async submitForm() {
      await this.axios
        .post('broadcast_messages', {
          broadcast_message: {
            content:      this.message,
            visibleUntil: this.daysVisible,
            targetGroup:  this.sentTo
          }
        })
        .then(response => {
          this.messageStore.setMessages(response);
          this.drawerStore.close();
        });
    },
    resetForm() {
      Object.assign(this.$data, this.$options.data.call(this));
    }
  }
};
</script>
