<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <p class="text-sm text-slate-500">Envie avisos para sua equipe via app, e-mail e WhatsApp.</p>
      <BaseButton
        v-if="$can.canAccess('operator')"
        icon="megaphone"
        @click="newComunicado"
      >
        Novo Comunicado
      </BaseButton>
    </div>

    <!-- Skeleton / Lista -->
    <SkeletonRows v-if="loading" :rows="3" />
    <div v-else-if="messageStore.messages.length" class="flex flex-col gap-2">
      <CardRow
        v-for="message in messageStore.messages"
        :key="message.id"
        :accent="isActive(message) ? 'border-l-2 border-l-green-500' : 'border-l-2 border-l-slate-200'"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="line-clamp-2 text-sm text-slate-800">{{ message.content }}</p>
            <div class="mt-1.5 flex flex-wrap items-center gap-2">
              <span :class="['inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold', isActive(message) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500']">
                {{ isActive(message) ? 'Ativo' : 'Expirado' }}
              </span>
              <span class="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                {{ audienceLabel(message.targetGroup) }}
              </span>
              <span class="text-xs text-slate-400">
                Enviado {{ moment(message.createdAt).format('DD/MM/YY') }} · Expira {{ moment(message.visibleUntil).format('DD/MM/YY') }}
              </span>
            </div>
          </div>
          <button
            v-if="$can.canAccess('operator')"
            type="button"
            class="flex-shrink-0 rounded-md p-1.5 text-slate-200 hover:bg-red-50 hover:text-red-500 transition-colors"
            @click="remove(message.id)"
          >
            <BaseIcon name="trash" class="!size-4" />
          </button>
        </div>
      </CardRow>
    </div>

    <!-- Empty state -->
    <Empty
      v-else-if="!loading"
      title="Nenhum comunicado ainda"
      :description="$can.canAccess('operator') ? 'Clique em &quot;Novo Comunicado&quot; para avisar sua equipe.' : 'Assim que um administrador enviar algum, você verá aqui.'"
    />

    <FormMessages v-if="$can.canAccess('operator')" />
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormMessages from '@/modules/calendar/form/Messages';
import { useMessageStore } from '@/modules/calendar/store/message';

export default {
  components: { BaseButton, BaseIcon, CardRow, Empty, SkeletonRows, FormMessages },
  data() {
    return { loading: true };
  },
  computed: {
    messageStore: () => useMessageStore()
  },
  async mounted() {
    try {
      await this.axios.get('broadcast_messages').then(r => this.messageStore.setMessages(r));
    } finally {
      this.loading = false;
    }
  },
  methods: {
    isActive(message) {
      return this.moment(message.visibleUntil).isAfter(this.moment());
    },
    audienceLabel(group) {
      return { all: 'Todos', user: 'Colaboradores', operator: 'Operadores' }[group] ?? 'Todos';
    },
    newComunicado() {
      this.drawerStore.setDrawer({ title: 'Enviar Comunicado', context: 'form-messages', open: true });
    },
    remove(id) {
      this.confirmationStore.setConfirmation({
        title: 'Remover comunicado?',
        description: 'O comunicado será removido e não aparecerá mais para a equipe.',
        open: true,
        onConfirm: async () => {
          await this.axios.delete('broadcast_messages/multiples', { data: { ids: [id] } })
            .then(r => {
              this.messageStore.setMessages(r);
              this.confirmationStore.close();
            });
        }
      });
    }
  }
};
</script>
