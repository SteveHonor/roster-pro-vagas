<template>
  <div class="w-full">
    <!-- Estado: aguardando email -->
    <div v-if="!sent">
      <p class="mb-5 text-sm text-slate-500">
        Digite seu e-mail e enviaremos um link para você entrar sem precisar de senha.
      </p>

      <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
        {{ error }}
      </div>

      <form class="space-y-4" @submit.prevent="send">
        <FormInput
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          label="E-mail"
          icon="Envelope"
        />

        <button
          type="submit"
          :disabled="loading"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none disabled:opacity-60"
        >
          <BaseIcon v-if="loading" name="ArrowPath" class="!size-4 animate-spin" />
          Enviar link de acesso
        </button>
      </form>
    </div>

    <!-- Estado: link enviado -->
    <div v-else class="text-center">
      <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <BaseIcon name="Envelope" class="!size-6 text-slate-700" />
      </div>
      <h3 class="mb-2 text-base font-semibold text-slate-800">Link enviado!</h3>
      <p class="text-sm text-slate-500">
        Verifique sua caixa de entrada. O link expira em <strong>15 minutos</strong>.
      </p>
    </div>

    <button
      type="button"
      class="mt-5 flex w-full justify-center text-sm text-slate-400 hover:text-slate-600"
      @click="$emit('cancel')"
    >
      Prefiro entrar com e-mail e senha
    </button>
  </div>
</template>

<script>
import FormInput from '@/components/form/Input';
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'MagicLinkForm',
  components: { FormInput, BaseIcon },
  emits: ['cancel'],
  data() {
    return {
      email:   '',
      loading: false,
      sent:    false,
      error:   ''
    };
  },
  methods: {
    send() {
      this.loading = true;
      this.error   = '';

      this.axios
        .post('magic_link', { email: this.email })
        .then(() => {
          this.sent = true;
        })
        .catch(() => {
          this.error = 'Ocorreu um erro. Tente novamente.';
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>
