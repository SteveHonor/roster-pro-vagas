<template>
  <div class="space-y-6">

    <!-- Admin+Owner: API REST + MCP -->
    <template v-if="isAdminOwner">

      <!-- Gate: plano não tem api_access -->
      <div v-if="!canUseApi" class="mx-auto max-w-2xl py-10">

        <div class="text-center">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500">
            <BaseIcon name="LockClosed" class="!size-3" />
            Disponível no Vagas Pro
          </span>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">Integre o RosterPro Vagas com qualquer sistema</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-500">
            Conecte vagas, candidatos e processos ao seu ATS, BI ou ferramentas internas.<br>
            Automatize fluxos de recrutamento com a API REST do RosterPro Vagas.
          </p>
        </div>

        <div class="mt-7 flex flex-wrap justify-center gap-2">
          <span
v-for="uc in useCases" :key="uc.label"
            class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
            <BaseIcon :name="uc.icon" class="!size-3.5 text-orange-400" />
            {{ uc.label }}
          </span>
        </div>

        <div class="mt-8 overflow-hidden rounded-xl bg-gray-900 shadow-lg">
          <div class="flex items-center gap-1.5 border-b border-gray-700 px-4 py-3">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
            <span class="ml-3 text-xs text-gray-500">GET /api/v1/vagas/jobs</span>
          </div>
          <div class="p-5 font-mono text-xs leading-6">
            <div><span class="text-purple-400">curl</span> <span class="text-gray-300">https://api.rosterpro.com.br/api/v1/vagas/jobs</span> <span class="text-gray-500">\</span></div>
            <div class="pl-5"><span class="text-gray-500">-H</span> <span class="text-green-400">"Authorization: Bearer <span class="text-orange-400">rp_live_••••••••••••</span>"</span></div>
            <div class="mt-4 text-gray-300">{</div>
            <div class="pl-5 text-gray-400">"data": [</div>
            <div class="pl-10"><span class="text-gray-400">{ "id": 1, "title": "</span><span class="text-green-400">Dev Sênior</span><span class="text-gray-400">", "status": "published", "applications": 12 },</span></div>
            <div class="pl-10"><span class="text-gray-400">{ "id": 2, "title": "</span><span class="text-yellow-400">UX Designer</span><span class="text-gray-400">", "status": "draft", "applications": 0 }</span></div>
            <div class="pl-5 text-gray-400">],</div>
            <div class="pl-5"><span class="text-gray-500">"total"</span><span class="text-gray-400">: 2</span></div>
            <div class="text-gray-300">}</div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            @click="planStore.setOpen('upgrade')"
          >
            <BaseIcon name="Rocket" class="!size-4" />
            Fazer upgrade para o Vagas Pro
          </button>
          <p class="mt-2.5 text-xs text-gray-400">A partir de R$ 149/mês &middot; Cancele quando quiser</p>
        </div>
      </div>

      <template v-else>

        <!-- SEÇÃO 1: API REST -->
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
            <div class="flex items-center gap-2.5">
              <BaseIcon name="Squares" class="!size-4 text-gray-500" />
              <div>
                <p class="text-sm font-semibold text-gray-900">API REST</p>
                <p class="text-xs text-gray-500">Conecte sistemas externos ao Roster Pro via API REST segura.</p>
              </div>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-md btn-brand px-4 py-2 text-sm font-semibold"
              @click="openCreate"
            >
              <BaseIcon name="Plus" class="!size-4" />
              Nova API key
            </button>
          </div>

          <!-- Lista de keys -->
          <div class="p-5">
            <SkeletonRows v-if="loading" :rows="3" has-trailing />

            <div v-else-if="keys.length === 0" class="rounded-xl border border-dashed border-gray-200 py-8 text-center">
              <p class="text-sm text-gray-400">Nenhuma API key criada ainda.</p>
              <p class="mt-1 text-xs text-gray-300">Crie uma key para começar a integrar.</p>
            </div>

            <table v-else class="w-full text-sm">
              <thead class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                <tr>
                  <th class="pb-3 text-left">Nome</th>
                  <th class="pb-3 text-left">Prefixo</th>
                  <th class="pb-3 text-left">Último uso</th>
                  <th class="pb-3 text-left">Criada em</th>
                  <th class="pb-3" />
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="key in keys" :key="key.id" class="hover:bg-gray-50/60">
                  <td class="py-3 pr-4 font-medium text-gray-800">{{ key.name }}</td>
                  <td class="py-3 pr-4">
                    <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{{ key.prefix }}...</code>
                  </td>
                  <td class="py-3 pr-4 text-gray-500">{{ key.lastUsedAt ? formatDate(key.lastUsedAt) : '—' }}</td>
                  <td class="py-3 pr-4 text-gray-500">{{ formatDate(key.createdAt) }}</td>
                  <td class="py-3 text-right">
                    <button
                      type="button"
                      class="text-xs text-red-400 transition hover:text-red-600"
                      @click="revokeTarget = key"
                    >
                      Revogar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Como usar — colapsável dentro da seção API -->
          <div class="border-t border-gray-100">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5 text-left"
              @click="showDocs = !showDocs"
            >
              <div class="flex items-center gap-2">
                <BaseIcon name="DocumentText" class="!size-4 text-gray-400" />
                <span class="text-sm font-medium text-gray-600">Como usar a API</span>
              </div>
              <BaseIcon :name="showDocs ? 'ChevronUp' : 'ChevronDown'" class="!size-4 text-gray-400" />
            </button>

            <div v-if="showDocs" class="border-t border-gray-100 px-5 pb-5 pt-4 space-y-6">

              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Autenticação</p>
                <p class="mb-3 text-xs text-gray-500">Todas as requisições precisam do header <code class="rounded bg-gray-100 px-1 py-0.5 text-gray-700">Authorization</code> com sua API key.</p>
                <div class="overflow-hidden rounded-lg bg-gray-900">
                  <div class="flex items-center gap-2 border-b border-gray-800 px-4 py-2">
                    <span class="h-2 w-2 rounded-full bg-red-500/70" />
                    <span class="h-2 w-2 rounded-full bg-yellow-500/70" />
                    <span class="h-2 w-2 rounded-full bg-green-500/70" />
                    <span class="ml-2 text-xs text-gray-500">Terminal</span>
                  </div>
                  <pre class="overflow-x-auto p-4 font-mono text-xs leading-6 text-gray-300">curl https://api.rosterpro.com.br/api/v1/users \
  -H <span class="text-green-400">"Authorization: Bearer rp_sua_key_aqui"</span></pre>
                </div>
              </div>

              <div>
                <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Endpoints disponíveis</p>
                <div class="overflow-hidden rounded-lg border border-gray-200">
                  <table class="w-full text-xs">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-2 text-left font-semibold text-gray-500">Método</th>
                        <th class="px-4 py-2 text-left font-semibold text-gray-500">Endpoint</th>
                        <th class="px-4 py-2 text-left font-semibold text-gray-500">Descrição</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="ep in endpoints" :key="ep.path" class="hover:bg-gray-50">
                        <td class="px-4 py-2.5">
                          <span :class="methodClass(ep.method)" class="rounded px-1.5 py-0.5 font-mono font-semibold">{{ ep.method }}</span>
                        </td>
                        <td class="px-4 py-2.5 font-mono text-gray-600">/api/v1/{{ ep.path }}</td>
                        <td class="px-4 py-2.5 text-gray-500">{{ ep.description }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Exemplo de resposta — <code class="lowercase normal-case text-gray-500">GET /api/v1/users</code></p>
                <div class="overflow-hidden rounded-lg bg-gray-900">
                  <pre class="overflow-x-auto p-4 font-mono text-xs leading-6"><span class="text-gray-400">{</span>
  <span class="text-blue-400">"data"</span><span class="text-gray-400">: [</span>
    <span class="text-gray-400">{</span>
      <span class="text-blue-400">"id"</span><span class="text-gray-400">:</span> <span class="text-yellow-300">"uuid"</span><span class="text-gray-400">,</span>
      <span class="text-blue-400">"name"</span><span class="text-gray-400">:</span> <span class="text-yellow-300">"Ana Lima"</span><span class="text-gray-400">,</span>
      <span class="text-blue-400">"email"</span><span class="text-gray-400">:</span> <span class="text-yellow-300">"ana@empresa.com"</span><span class="text-gray-400">,</span>
      <span class="text-blue-400">"profile"</span><span class="text-gray-400">:</span> <span class="text-yellow-300">"operator"</span>
    <span class="text-gray-400">}</span>
  <span class="text-gray-400">],</span>
  <span class="text-blue-400">"meta"</span><span class="text-gray-400">: {</span> <span class="text-blue-400">"total"</span><span class="text-gray-400">:</span> <span class="text-purple-400">42</span> <span class="text-gray-400">}</span>
<span class="text-gray-400">}</span></pre>
                </div>
              </div>

              <div class="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <BaseIcon name="Exclamation" class="!size-4 flex-shrink-0 text-blue-400 mt-0.5" />
                <p class="text-xs text-blue-700">
                  As keys têm escopo somente leitura. Cada key é única por conta e pode ser revogada a qualquer momento.
                  Em caso de comprometimento, revogue imediatamente e gere uma nova.
                </p>
              </div>

              <div class="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <BaseIcon name="Sparkles" class="!size-4 flex-shrink-0 text-gray-400 mt-0.5" />
                <p class="text-xs text-gray-500">
                  Nossa API está em constante evolução. Novos endpoints serão disponibilizados em breve —
                  incluindo criação de vagas, gerenciamento de candidatos e notificações.
                  Acompanhe as novidades no changelog da plataforma.
                </p>
              </div>

            </div>
          </div>
        </div>

        <!-- SEÇÃO 2: MCP -->
        <div class="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/30">
          <button
            type="button"
            class="flex w-full items-center justify-between px-5 py-4 text-left"
            @click="showMcp = !showMcp"
          >
            <div class="flex items-center gap-2.5">
              <BaseIcon name="Sparkles" class="!size-4 text-violet-500" />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-700">Integração via MCP (ChatGPT & Claude)</span>
                  <span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-600">Novo</span>
                </div>
                <p class="text-xs text-gray-500">Use linguagem natural para consultar vagas, candidatos e processos seletivos.</p>
              </div>
            </div>
            <BaseIcon :name="showMcp ? 'ChevronUp' : 'ChevronDown'" class="!size-4 text-gray-400" />
          </button>

          <div v-if="showMcp" class="border-t border-violet-200 px-5 pb-5 pt-4 space-y-4">
            <p class="text-xs text-gray-600 leading-relaxed">
              Conecte o Roster Pro ao <strong>ChatGPT</strong>, <strong>Claude</strong> ou qualquer assistente compatível com MCP.
              Consulte vagas, mova candidatos no pipeline e envie mensagens por linguagem natural — sem abrir o app.
            </p>

            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Configuração — Claude Desktop</p>
              <p class="mb-2 text-xs text-gray-500">
                Adicione em <code class="rounded bg-gray-100 px-1 py-0.5 text-gray-700">~/Library/Application Support/Claude/claude_desktop_config.json</code>:
              </p>
              <div class="overflow-hidden rounded-lg bg-gray-900">
                <div class="flex items-center gap-2 border-b border-gray-800 px-4 py-2">
                  <span class="h-2 w-2 rounded-full bg-red-500/70" />
                  <span class="h-2 w-2 rounded-full bg-yellow-500/70" />
                  <span class="h-2 w-2 rounded-full bg-green-500/70" />
                  <span class="ml-2 text-xs text-gray-500">claude_desktop_config.json</span>
                </div>
                <pre class="overflow-x-auto p-4 font-mono text-xs leading-6 text-gray-300">{
  <span class="text-blue-400">"mcpServers"</span>: {
    <span class="text-blue-400">"roster-pro"</span>: {
      <span class="text-blue-400">"url"</span>: <span class="text-green-400">"https://mcp.rosterpro.com.br/mcp"</span>,
      <span class="text-blue-400">"headers"</span>: {
        <span class="text-blue-400">"Authorization"</span>: <span class="text-orange-400">"Bearer SUA_API_KEY"</span>
      }
    }
  }
}</pre>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
              <BaseIcon name="Sparkles" class="!size-4 flex-shrink-0 text-violet-400 mt-0.5" />
              <p class="text-xs text-violet-700">
                Após configurar, reinicie o assistente. Pergunte: <em>"Quantos candidatos chegaram na etapa final essa semana?"</em>
              </p>
            </div>

            <a
              href="https://www.rosterpro.com.br/integracoes/mcp"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
            >
              Ver documentação completa
              <BaseIcon name="ArrowRight" class="!size-3" />
            </a>
          </div>
        </div>

      </template>
    </template>

    <!-- Modal: criar key -->
    <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <p class="mb-4 text-sm font-bold text-gray-900">Nova API key</p>

        <!-- Exibição da key gerada -->
        <div v-if="newKey" class="space-y-4">
          <div class="rounded-lg border border-green-200 bg-green-50 p-4">
            <p class="mb-2 text-xs font-semibold text-green-700">Sua chave foi gerada. Copie agora — ela não será exibida novamente.</p>
            <code class="block break-all text-xs text-green-900 mb-3">{{ newKey }}</code>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
              @click="copyKey"
            >
              <BaseIcon :name="copied ? 'CheckCircle' : 'Clipboard'" class="!size-3.5" :class="copied ? 'text-green-600' : ''" />
              {{ copied ? 'Copiado!' : 'Copiar chave' }}
            </button>
          </div>
          <button
            type="button"
            class="w-full rounded-md btn-brand py-2 text-sm font-semibold"
            @click="closeCreate"
          >
            Fechar
          </button>
        </div>

        <!-- Formulário de criação -->
        <div v-else class="space-y-4">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-700">Nome da key</label>
            <input
              v-model="newKeyName"
              type="text"
              placeholder="Ex: ERP Integration"
              class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              @keyup.enter="createKey"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" class="text-sm text-gray-400 hover:text-gray-600" @click="showCreate = false">Cancelar</button>
            <button
              type="button"
              :disabled="!newKeyName.trim() || creating"
              class="rounded-md btn-brand px-4 py-2 text-sm font-semibold disabled:opacity-40"
              @click="createKey"
            >
              {{ creating ? 'Gerando...' : 'Gerar key' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: confirmar revogação -->
    <div v-if="revokeTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <p class="mb-1 text-sm font-bold text-gray-900">Revogar API key?</p>
        <p class="mb-5 text-xs text-gray-500">
          A key <strong>{{ revokeTarget.name }}</strong> será invalidada imediatamente.
          Sistemas que a utilizam perderão acesso.
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="text-sm text-gray-400 hover:text-gray-600" @click="revokeTarget = null">
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            @click="confirmRevoke"
          >
            Sim, revogar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'ApiKeysSettings',
  components: { BaseIcon, SkeletonRows },
  data() {
    return {
      keys:         [],
      loading:      true,
      showCreate:   false,
      showDocs:     false,
      showMcp:      false,
      newKeyName:   '',
      newKey:       null,
      creating:     false,
      copied:       false,
      revokeTarget: null,
      endpoints: [
        { method: 'GET',   path: 'vagas/jobs',                       description: 'Lista vagas da conta' },
        { method: 'POST',  path: 'vagas/jobs',                       description: 'Cria nova vaga' },
        { method: 'GET',   path: 'vagas/jobs/:id',                   description: 'Detalhes de uma vaga' },
        { method: 'PATCH', path: 'vagas/jobs/:id/publish',           description: 'Publica uma vaga' },
        { method: 'GET',   path: 'vagas/jobs/:id/applications',      description: 'Lista candidaturas de uma vaga' },
        { method: 'PATCH', path: 'vagas/applications/:id/stage',     description: 'Move candidato de etapa no pipeline' },
        { method: 'GET',   path: 'users',                            description: 'Lista recrutadores da conta' },
      ],
      useCases: [
        { label: 'Sincronize com ATS',             icon: 'Squares'      },
        { label: 'Exporte para BI',                icon: 'ChartBar'     },
        { label: 'Integre com LinkedIn/Indeed',    icon: 'Users'        },
        { label: 'Automatize notificações',        icon: 'Bell'         },
        { label: 'Atualizações em tempo real',     icon: 'ArrowPath'    },
        { label: 'Workflows de onboarding',        icon: 'Cog'          }
      ]
    };
  },
  computed: {
    authStore:  () => useAuthStore(),
    planStore:  () => usePlanStore(),
    canUseApi() { return this.planStore.features?.apiAccess === true; },
    isAdminOwner() {
      return this.authStore.me?.owner && this.authStore.me?.profile === 'admin';
    }
  },
  mounted() {
    if (this.canUseApi) this.fetchKeys();
  },
  methods: {
    async fetchKeys() {
      this.loading = true;
      try {
        const data = await this.axios.get('/api_keys');
        this.keys = data;
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.newKeyName = '';
      this.newKey     = null;
      this.showCreate = true;
    },
    closeCreate() {
      this.showCreate = false;
      this.newKey     = null;
      this.fetchKeys();
    },
    async createKey() {
      if (!this.newKeyName.trim()) return;
      this.creating = true;
      try {
        const data = await this.axios.post('/api_keys', { name: this.newKeyName.trim() });
        this.newKey = data.key;
        this.keys.unshift({ id: data.id, name: data.name, prefix: data.prefix, lastUsedAt: null, createdAt: data.createdAt });
      } finally {
        this.creating = false;
      }
    },
    async copyKey() {
      try {
        await navigator.clipboard.writeText(this.newKey);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2000);
      } catch {
        // clipboard não disponível — usuário pode copiar manualmente
      }
    },
    async confirmRevoke() {
      const key = this.revokeTarget;
      this.revokeTarget = null;
      await this.axios.delete(`/api_keys/${key.id}`);
      this.keys = this.keys.filter(k => k.id !== key.id);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    methodClass(method) {
      return {
        GET:   'text-green-700 bg-green-50',
        POST:  'text-blue-700 bg-blue-50',
        PATCH: 'text-yellow-700 bg-yellow-50',
        DELETE:'text-red-700 bg-red-50',
      }[method] ?? 'text-gray-700 bg-gray-100';
    }
  }
};
</script>
