<template>
  <div>

    <!-- ── ESTADO BLOQUEADO ─────────────────────────────────────────── -->
    <div v-if="!canUseBranding" class="flex flex-col items-center py-16 text-center">

      <span class="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500">
        <BaseIcon name="LockClosed" class="!size-3" />
        Disponível a partir do plano Pro
      </span>

      <h2 class="mt-5 text-2xl font-bold text-gray-900">Identidade Visual</h2>
      <p class="mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        Adicione o logo da sua empresa e escolha as cores da interface.
        Sua equipe verá sua marca — não a nossa.
      </p>

      <!-- Comparativo Antes / Depois -->
      <div class="mt-12 flex items-center gap-10">

        <!-- Agora: identidade padrão -->
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-400">Agora</p>
          <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm" style="width:210px;height:160px">
            <div class="flex h-full">
              <div class="flex w-24 flex-shrink-0 flex-col gap-1.5 bg-gray-800 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <div class="h-3.5 w-3.5 rounded bg-gray-600" />
                  <div class="h-2 w-12 rounded bg-gray-600" />
                </div>
                <div v-for="i in 4" :key="i" class="flex items-center gap-2 rounded px-1.5 py-1">
                  <div class="h-1.5 w-1.5 flex-shrink-0 rounded-sm bg-gray-600" />
                  <div class="h-1.5 rounded bg-gray-600" :style="`width:${[34,26,30,22][i-1]}px`" />
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-2.5 bg-white p-3">
                <div class="h-2 w-full rounded bg-gray-100" />
                <div class="h-2 w-3/4 rounded bg-gray-100" />
                <div class="mt-1 h-3 w-full rounded bg-gray-100" />
                <div class="h-3 w-full rounded bg-gray-100" />
                <div class="h-3 w-2/3 rounded bg-gray-100" />
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-400">Genérico, sem identidade</p>
        </div>

        <!-- Seta -->
        <BaseIcon name="ChevronRight" class="!size-7 flex-shrink-0 text-gray-300" />

        <!-- Com Pro: identidade própria -->
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-orange-500">Com Pro</p>
          <div class="overflow-hidden rounded-xl border-2 border-orange-300 shadow-lg" style="width:210px;height:160px">
            <div class="flex h-full">
              <div class="flex w-24 flex-shrink-0 flex-col gap-1.5 bg-gray-800 p-3">
                <div class="mb-3 flex items-center gap-2">
                  <div class="h-3.5 w-3.5 rounded bg-orange-400" />
                  <div class="h-2 w-12 rounded bg-orange-300 opacity-70" />
                </div>
                <div
                  v-for="i in 4" :key="i"
                  class="flex items-center gap-2 rounded px-1.5 py-1"
                  :class="i === 1 ? 'bg-orange-500/20' : ''"
                >
                  <div class="h-1.5 w-1.5 flex-shrink-0 rounded-sm" :class="i === 1 ? 'bg-orange-400' : 'bg-gray-600'" />
                  <div
                    class="h-1.5 rounded"
                    :class="i === 1 ? 'bg-orange-300' : 'bg-gray-600'"
                    :style="`width:${[34,26,30,22][i-1]}px`"
                  />
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-2.5 bg-white p-3">
                <div class="flex items-center justify-between">
                  <div class="h-2 w-12 rounded bg-gray-200" />
                  <div class="h-4 w-10 rounded bg-orange-500" />
                </div>
                <div class="h-2 w-3/4 rounded bg-gray-100" />
                <div class="flex gap-1.5">
                  <div v-for="i in 3" :key="i" class="h-6 flex-1 rounded border border-orange-100 bg-orange-50" />
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs font-medium text-orange-500">Sua marca, sua identidade</p>
        </div>

      </div>

      <!-- CTA -->
      <div class="mt-12 flex flex-col items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-2 rounded-md bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          @click="openUpgrade"
        >
          <BaseIcon name="Rocket" class="!size-4" />
          Fazer upgrade — a partir de R$ 29/mês
        </button>
        <p class="text-xs text-gray-400">Cancele quando quiser · Essential e superiores</p>
      </div>

    </div>

    <!-- ── ESTADO DESBLOQUEADO ──────────────────────────────────────── -->
    <fieldset v-if="canUseBranding" class="space-y-5">

      <div>
        <p class="text-sm font-bold text-gray-900">Identidade Visual</p>
        <p class="mt-0.5 text-xs text-gray-500">Sua equipe vê sua marca toda vez que acessa o sistema.</p>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">

        <!-- Formulário -->
        <div class="space-y-4">
          <!-- Logo -->
          <div class="rounded-xl border border-gray-200 p-5">
            <h3 class="mb-1 text-sm font-semibold text-gray-700">Logo da empresa</h3>
            <p class="mb-4 text-xs text-gray-400">Aparece no topo da barra lateral para toda a equipe.</p>
            <!-- Thumbnail em proporção de sidebar (wide) para não distorcer -->
            <div class="mb-4 flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-4">
              <img v-if="logoPreview" :src="logoPreview" alt="Logo" class="max-h-10 w-auto max-w-full object-contain" />
              <div v-else class="flex items-center gap-2 text-gray-300">
                <BaseIcon name="Company" class="!size-5" />
                <span class="text-xs">Nenhum logo</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <label class="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {{ logoFile ? logoFile.name : 'Escolher imagem' }}
                <input type="file" accept="image/*" class="hidden" @change="onLogoChange" />
              </label>
              <p class="text-xs text-gray-400">PNG, JPG ou SVG. Recomendado: 200×60px.</p>
            </div>
          </div>

          <!-- Cor primária -->
          <div class="rounded-xl border border-gray-200 p-5">
            <h3 class="mb-1 text-sm font-semibold text-gray-700">Cor primária</h3>
            <p class="mb-4 text-xs text-gray-400">Define a cor dos botões, links e destaques da interface.</p>
            <div class="flex items-center gap-3">
              <input
                type="color"
                :value="colorInput"
                class="h-10 w-14 cursor-pointer rounded border border-gray-200 p-0.5"
                @input="onColorInput"
              />
              <input
                v-model="colorInput"
                type="text"
                maxlength="7"
                placeholder="#4f46e5"
                class="w-28 rounded-md border border-gray-200 px-3 py-2 text-sm font-mono uppercase"
                @input="onColorInput"
              />
              <div class="h-8 w-8 rounded-md border border-gray-200 shadow-sm" :style="{ backgroundColor: colorInput }" />
            </div>
          </div>

          <!-- Botão único de salvar -->
          <div class="flex justify-end">
            <button
              type="button"
              :disabled="saving || saved"
              class="btn-brand flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              :class="saved ? '!bg-green-600 !text-white' : ''"
              @click="saveAll"
            >
              <BaseIcon v-if="saved" name="check" class="!size-4" />
              {{ saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações' }}
            </button>
          </div>
        </div>

        <!-- Live preview -->
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Pré-visualização</p>
          <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div class="flex" style="height:220px">
              <!-- Sidebar — tema claro (igual ao sistema atual) -->
              <div class="flex w-36 flex-shrink-0 flex-col gap-1 border-r border-gray-100 bg-white p-3">
                <!-- Logo adaptativo: object-contain dentro de área proporcional -->
                <div class="mb-3 flex h-10 w-full items-center overflow-hidden">
                  <img v-if="logoPreview" :src="logoPreview" class="max-h-full w-auto max-w-full object-contain" alt="" />
                  <div v-else class="flex items-center gap-1.5">
                    <div class="h-4 w-4 rounded bg-gray-200" />
                    <div class="h-2 w-14 rounded bg-gray-200" />
                  </div>
                </div>
                <div
                  v-for="(item, i) in navItems"
                  :key="i"
                  class="flex items-center gap-2 rounded-md px-2 py-1.5"
                  :style="i === 0 ? `background:${colorInput}15;color:${colorInput}` : 'color:#9ca3af'"
                >
                  <div
class="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    :style="i === 0 ? `background:${colorInput}` : 'background:#d1d5db'" />
                  <span class="text-[10px] font-medium">{{ item }}</span>
                </div>
              </div>
              <!-- Conteúdo -->
              <div class="flex flex-1 flex-col gap-3 bg-white p-4">
                <div class="flex items-center justify-between">
                  <div class="h-3 w-20 rounded bg-gray-200" />
                  <div class="flex h-6 items-center rounded-md px-3 text-[10px] font-semibold" :style="`background:${colorInput};color:${contrastColor(colorInput)}`">+ Novo</div>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <div v-for="i in 3" :key="i" class="rounded-lg border border-gray-100 p-2">
                    <div class="mb-1.5 h-1.5 w-full rounded bg-gray-100" />
                    <div class="h-2 w-8 rounded" :style="`background:${colorInput}30`" />
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <div v-for="i in 3" :key="i" class="flex items-center gap-2 rounded border border-gray-100 px-2 py-1.5">
                    <div class="h-4 w-4 flex-shrink-0 rounded-full bg-gray-200" />
                    <div class="h-1.5 flex-1 rounded bg-gray-100" />
                    <div class="rounded px-1.5 py-0.5 text-[9px] font-semibold" :style="`background:${colorInput}15;color:${colorInput}`">Ativo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-2.5 text-center text-xs text-gray-400">Atualiza conforme você edita</p>
        </div>

      </div>
    </fieldset>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';

function darkenHex(hex, pct) {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = 1 - pct / 100;
  const r = Math.round(((n >> 16) & 0xff) * f);
  const g = Math.round(((n >> 8)  & 0xff) * f);
  const b = Math.round((n         & 0xff) * f);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export default {
  name: 'BrandingSettings',
  components: { BaseIcon },
  data() {
    const authStore = useAuthStore();
    return {
      logoFile:    null,
      logoPreview: authStore.branding?.logoUrl || null,
      colorInput:  authStore.branding?.primaryColor || '#4f46e5',
      saving:   false,
      saved:    false,
      navItems: ['Escalas', 'Equipe', 'Relatórios', 'Configurações']
    };
  },
  computed: {
    authStore:     () => useAuthStore(),
    planStore:     () => usePlanStore(),
    canUseBranding() { return this.planStore.features?.whiteLabel === true; }
  },
  methods: {
    openUpgrade() { this.planStore.setOpen('upgrade'); },
    contrastColor(hex) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return '#ffffff';
      const n = parseInt(hex.replace('#', ''), 16);
      const l = (0.299 * ((n >> 16) & 0xff) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
      return l > 0.55 ? '#111111' : '#ffffff';
    },
    onLogoChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => { this.logoPreview = ev.target.result; };
      reader.readAsDataURL(file);
    },
    onColorInput(e) {
      const val = e.target.value;
      this.colorInput = val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        document.documentElement.style.setProperty('--brand-primary',      val);
        document.documentElement.style.setProperty('--brand-primary-dark', darkenHex(val, 15));
        document.documentElement.style.setProperty('--brand-primary-text', this.contrastColor(val));
      }
    },
    async saveAll() {
      this.saving = true;
      try {
        let res;
        if (this.logoFile) {
          const form = new FormData();
          form.append('logo', this.logoFile);
          form.append('primary_color', this.colorInput);
          res = await this.axios.patch('/tenant/branding', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          res = await this.axios.patch('/tenant/branding', { primaryColor: this.colorInput });
        }
        this.authStore.branding = {
          logoUrl:      res.logoUrl      ?? this.authStore.branding.logoUrl,
          primaryColor: res.primaryColor ?? this.colorInput
        };
        this.logoFile = null;
        this.saved = true;
        setTimeout(() => { this.saved = false; }, 2500);
      } catch { /* toast global */ } finally { this.saving = false; }
    }
  }
};
</script>
