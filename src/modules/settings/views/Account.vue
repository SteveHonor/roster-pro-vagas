<template>
  <!-- Skeleton loading -->
  <div v-if="!user" class="space-y-4">
    <SkeletonRows :rows="1" has-avatar />
    <SkeletonRows :rows="3" has-prefix has-trailing />
  </div>

  <template v-else>

    <!-- Header de perfil -->
    <div v-if="!hideHeader" class="mb-5 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold uppercase text-white shadow ring-4 ring-white">
          {{ user?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-semibold text-gray-900">{{ user?.name || 'Colaborador sem nome' }}</h2>
            <span v-if="planStore?.name" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {{ planStore.name }}
            </span>
            <span v-if="user?.status !== 'active'" class="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
              Bloqueado
            </span>
          </div>
          <p class="mt-0.5 text-sm text-gray-500">{{ user?.email }}</p>
          <div class="mt-1.5 flex items-center gap-3">
            <span class="flex items-center gap-1 text-xs text-gray-400">
              <BaseIcon name="Shield" class="h-3 w-3" />
              {{ user?.profile || 'colaborador' }}
            </span>
            <RatingStars class="text-sm md:hidden" :rating="user?.averageRating" mode="numeric" />
          </div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <RatingStars class="hidden text-base md:flex" :rating="user?.averageRating" mode="numeric" />
        <button
          class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          @click="editUser"
        >
          <BaseIcon name="pencil" class="h-3.5 w-3.5" />
          Editar perfil
        </button>
      </div>
    </div>

    <!-- Sub-tabs (pill style, igual ao Tab do sistema) -->
    <div class="scrollbar-hide mb-5 overflow-x-auto">
      <div class="flex w-fit gap-1 rounded-md bg-gray-200/80 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all"
          :class="activeTab === tab.id
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-900'"
          @click="activeTab = tab.id"
        >
          <BaseIcon :name="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab: Perfil -->
    <div v-show="activeTab === 'perfil'" class="space-y-4">

      <div
        class="grid gap-4"
        :class="user?.company?.id && user?.company?.name && user?.company?.document ? 'md:grid-cols-2' : 'md:grid-cols-1'"
      >
        <!-- Dados pessoais -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div class="flex items-center gap-2">
              <BaseIcon name="User" class="h-4 w-4 text-gray-400" />
              <div>
                <p class="text-sm font-semibold text-gray-800">Informações pessoais</p>
                <p class="text-xs text-gray-400">Seus dados básicos de cadastro</p>
              </div>
            </div>
            <button class="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700" @click="editUser">
              <BaseIcon name="pencil" class="!size-3.5" />
            </button>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Telefone</span>
              <span class="text-sm text-gray-900">{{ user?.phone || '—' }}</span>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Perfil</span>
              <span class="text-sm text-gray-900">{{ user?.profile || '—' }}</span>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Primeiro acesso</span>
              <span class="text-sm font-medium" :class="user?.firstAccess ? 'text-amber-600' : 'text-green-600'">
                {{ user?.firstAccess ? 'Pendente' : 'Concluído' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Instituição -->
        <div
          v-if="user?.company?.id && user?.company?.name && user?.company?.document"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div class="flex items-center gap-2">
              <BaseIcon name="Company" class="h-4 w-4 text-gray-400" />
              <div>
                <p class="text-sm font-semibold text-gray-800">
                  {{ $can.canAccess('admin') ? 'Instituição' : 'Conta gerenciada por' }}
                </p>
                <p class="text-xs text-gray-400">Organização vinculada à sua conta</p>
              </div>
            </div>
            <button v-if="$can.canAccess('admin')" class="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700" @click="editCompany">
              <BaseIcon name="pencil" class="!size-3.5" />
            </button>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Nome</span>
              <span class="text-sm text-gray-900">{{ user?.company?.name || '—' }}</span>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Documento</span>
              <span class="text-sm text-gray-900">{{ user?.company?.document || '—' }}</span>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Cidade</span>
              <span class="text-sm text-gray-900">{{ user?.company?.city }} - {{ user?.company?.state }}</span>
            </div>
            <div class="flex items-center gap-4 px-4 py-3">
              <span class="w-28 shrink-0 text-xs font-medium text-gray-500">Telefone</span>
              <span class="text-sm text-gray-900">{{ user?.company?.phone || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Seus dados (LGPD) -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <BaseIcon name="Shield" class="h-4 w-4 text-gray-400" />
          <div>
            <p class="text-sm font-semibold text-gray-800">Seus dados (LGPD)</p>
            <p class="text-xs text-gray-400">Direito de acessar, corrigir ou exportar seus dados a qualquer momento</p>
          </div>
        </div>
        <div class="p-4">
          <div class="flex flex-wrap gap-2">
            <button
              :disabled="downloading"
              class="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              @click="downloadData"
            >
              <BaseIcon name="ArchiveBox" class="h-4 w-4" />
              {{ downloading ? 'Preparando...' : 'Baixar meus dados' }}
            </button>
            <router-link
              to="/politics"
              class="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <BaseIcon name="DocumentText" class="h-4 w-4" />
              Política de Privacidade
            </router-link>
          </div>
          <p class="mt-3 text-xs text-gray-400">
            Dúvidas ou solicitações de exclusão?
            <a href="mailto:contato@rosterpro.com.br" class="underline hover:text-gray-600">contato@rosterpro.com.br</a>
          </p>
        </div>
      </div>

    </div>

    <!-- Tab: Segurança -->
    <div v-show="activeTab === 'seguranca'" class="space-y-4">

      <!-- ── GOOGLE ── -->
      <template v-if="user?.provider === 'google'">
        <div class="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 533.5 544.3" class="shrink-0">
            <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h146.9c-6.4 34.7-25.7 64.1-54.8 83.5v69.1h88.7c52-47.9 80.6-118.5 80.6-197.5z"/>
            <path fill="#34a853" d="M272.1 544.3c73.9 0 135.9-24.5 181.2-66.6l-88.7-69.1c-24.6 16.5-56.2 26.2-92.5 26.2-71.1 0-131.4-48-153-112.8h-90v70.9c45.4 89.7 138.7 151.4 243 151.4z"/>
            <path fill="#fbbc04" d="M119.1 321.9c-10.3-30.6-10.3-63.7 0-94.3v-70.9h-90c-38.1 74.9-38.1 161.2 0 236.1l90-70.9z"/>
            <path fill="#ea4335" d="M272.1 107.4c39.9 0 75.8 13.8 104.2 40.8l78.1-78.1C407.9 24.2 345.9 0 272.1 0 167.8 0 74.5 61.7 29.1 151.4l90 70.9c21.6-64.8 81.9-112.8 153-112.8z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-blue-800">Você acessa com Google</p>
            <p class="mt-0.5 text-xs text-blue-600">Sua segurança é gerenciada pela sua conta Google. Não é necessário senha ou PIN aqui.</p>
          </div>
        </div>
      </template>

      <!-- ── PIN ── -->
      <template v-else-if="user?.pinConfigured || (!user?.hasPassword && !$can.canAccess('operator'))">

        <!-- Status -->
        <div
          class="flex items-center gap-3 rounded-xl border px-4 py-4"
          :class="{
            'border-blue-100 bg-blue-50':   user?.pinConfigured && authStore.loginMethod === 'magic_link',
            'border-green-100 bg-green-50': user?.pinConfigured && authStore.loginMethod !== 'magic_link',
            'border-amber-100 bg-amber-50': !user?.pinConfigured
          }"
        >
          <BaseIcon
            :name="user?.pinConfigured ? 'CheckCircle' : 'Exclamation'"
            class="h-5 w-5 shrink-0"
            :class="{
              'text-blue-500':  user?.pinConfigured && authStore.loginMethod === 'magic_link',
              'text-green-500': user?.pinConfigured && authStore.loginMethod !== 'magic_link',
              'text-amber-500': !user?.pinConfigured
            }"
          />
          <div>
            <p
              class="text-sm font-semibold"
              :class="{
                'text-blue-800':  user?.pinConfigured && authStore.loginMethod === 'magic_link',
                'text-green-800': user?.pinConfigured && authStore.loginMethod !== 'magic_link',
                'text-amber-800': !user?.pinConfigured
              }"
            >
              <template v-if="user?.pinConfigured && authStore.loginMethod === 'magic_link'">Você entrou com link mágico desta vez</template>
              <template v-else-if="user?.pinConfigured">Você acessa com PIN de 4 dígitos</template>
              <template v-else>Você ainda não tem um PIN</template>
            </p>
            <p
              class="mt-0.5 text-xs"
              :class="{
                'text-blue-600':  user?.pinConfigured && authStore.loginMethod === 'magic_link',
                'text-green-600': user?.pinConfigured && authStore.loginMethod !== 'magic_link',
                'text-amber-600': !user?.pinConfigured
              }"
            >
              <template v-if="user?.pinConfigured && authStore.loginMethod === 'magic_link'">Você tem um PIN configurado. Se preferir, use-o na próxima vez que entrar — é mais rápido.</template>
              <template v-else-if="user?.pinConfigured">Você pode trocar seu PIN quando quiser usando o formulário abaixo.</template>
              <template v-else>No momento você acessa via link mágico por e-mail. Definir um PIN torna o acesso mais rápido — basta digitar 4 dígitos.</template>
            </p>
          </div>
        </div>

        <!-- Formulário PIN -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <BaseIcon name="HashTag" class="h-4 w-4 text-gray-400" />
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ user?.pinConfigured ? 'Trocar PIN' : 'Criar meu PIN' }}</p>
              <p class="text-xs text-gray-400">{{ user?.pinConfigured ? 'Escolha 4 novos dígitos.' : 'Escolha 4 dígitos fáceis de lembrar.' }}</p>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <p class="mb-3 text-center text-xs font-medium text-gray-500">
                {{ pinStep === 1 ? 'Novo PIN' : 'Confirme digitando novamente' }}
              </p>
              <PinInput v-if="pinStep === 1" ref="pinNewRef" v-model="pinForm.pin" @complete="pinStep = 2; $nextTick(() => $refs.pinConfirmRef?.focus())" />
              <PinInput v-else ref="pinConfirmRef" v-model="pinForm.confirmation" :error="!!pinError" @complete="savePin" />
            </div>
            <p v-if="pinError" class="flex items-center justify-center gap-1.5 text-xs text-red-500">
              <BaseIcon name="Exclamation" class="h-3.5 w-3.5 shrink-0" />{{ pinError }}
            </p>
            <p v-if="pinSuccess" class="flex items-center justify-center gap-1.5 text-xs text-green-600">
              <BaseIcon name="CheckCircle" class="h-3.5 w-3.5 shrink-0" />{{ pinSuccess }}
            </p>
            <div class="flex items-center justify-between text-xs text-gray-400">
              <button v-if="pinStep === 2" type="button" class="hover:text-gray-600" @click="resetPinForm">← Voltar</button>
              <span v-else />
              <span>{{ pinStep === 1 ? 'Digite 4 dígitos para continuar' : 'Repita o PIN para confirmar' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ── SENHA (admin / operator) ── -->
      <template v-else>
        <div class="flex items-center gap-3 rounded-xl border px-4 py-4" :class="user?.hasPassword ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'">
          <BaseIcon :name="user?.hasPassword ? 'CheckCircle' : 'Exclamation'" class="h-5 w-5 shrink-0" :class="user?.hasPassword ? 'text-green-500' : 'text-amber-500'" />
          <div>
            <p class="text-sm font-semibold" :class="user?.hasPassword ? 'text-green-800' : 'text-amber-800'">
              <template v-if="user?.hasPassword">Senha definida</template>
              <template v-else>Você ainda não tem senha</template>
            </p>
            <p class="mt-0.5 text-xs" :class="user?.hasPassword ? 'text-green-600' : 'text-amber-600'">
              <template v-if="user?.hasPassword">Você pode entrar com e-mail e senha ou usando o link mágico.</template>
              <template v-else>No momento você acessa apenas via link mágico por e-mail.</template>
            </p>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <BaseIcon name="LockClosed" class="h-4 w-4 text-gray-400" />
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ user?.hasPassword ? 'Trocar senha' : 'Criar senha' }}</p>
              <p class="text-xs text-gray-400">{{ user?.hasPassword ? 'Recomendamos trocar periodicamente.' : 'Crie uma senha para entrar sem precisar do link.' }}</p>
            </div>
          </div>
          <div class="p-4 space-y-4">
            <div
              v-if="authStore.loginMethod === 'magic_link' && user?.hasPassword"
              class="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600"
            >
              <BaseIcon name="LockClosed" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>Você entrou via <strong>link mágico</strong> — sua identidade já foi verificada. Pode criar uma nova senha sem precisar da atual.</span>
            </div>
            <div v-if="user?.hasPassword && authStore.loginMethod !== 'magic_link'">
              <FormInput v-model="passwordForm.current" type="password" label="Senha atual" placeholder="••••••••" icon="LockClosed" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <FormInput v-model="passwordForm.password" type="password" label="Nova senha" placeholder="Mínimo 8 caracteres" icon="LockClosed" />
              <FormInput v-model="passwordForm.confirmation" type="password" label="Confirmar senha" placeholder="Repita a senha" icon="LockClosed" />
            </div>
            <p v-if="passwordError" class="flex items-center gap-1.5 text-xs text-red-500">
              <BaseIcon name="Exclamation" class="h-3.5 w-3.5 shrink-0" />{{ passwordError }}
            </p>
            <p v-if="passwordSuccess" class="flex items-center gap-1.5 text-xs text-green-600">
              <BaseIcon name="CheckCircle" class="h-3.5 w-3.5 shrink-0" />{{ passwordSuccess }}
            </p>
            <p class="text-xs text-gray-400">Mínimo 8 caracteres. Use letras maiúsculas, números e símbolos.</p>
            <BaseButton :loading="savingPassword" :disabled="savingPassword" @click="savePassword">
              {{ savingPassword ? 'Salvando...' : user?.hasPassword ? 'Trocar senha' : 'Criar senha' }}
            </BaseButton>
          </div>
        </div>
      </template>

      <!-- Backup da conta (admin/operator) -->
      <div
        v-if="$can.canAccess('admin') || $can.canAccess('operator')"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <BaseIcon name="ArchiveBox" class="h-4 w-4 text-gray-400" />
          <div>
            <p class="text-sm font-semibold text-gray-800">Backup da conta</p>
            <p class="text-xs text-gray-400">Exporte colaboradores, vagas e candidaturas em um único arquivo JSON</p>
          </div>
        </div>
        <div class="p-4">
          <button
            :disabled="downloadingBackup"
            class="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            @click="downloadBackup"
          >
            <BaseIcon name="ArchiveBox" class="h-4 w-4" />
            {{ downloadingBackup ? 'Gerando backup...' : 'Baixar backup da conta' }}
          </button>
          <p class="mt-3 text-xs text-gray-400">Mantenha o arquivo em local seguro — ele contém dados de toda a organização.</p>
        </div>
      </div>

    </div>

    <!-- Tab: Faturamento (admin only) -->
    <div v-show="activeTab === 'faturamento'" class="space-y-4">

      <!-- Próxima cobrança -->
      <div v-if="nextBilling" class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div class="flex items-center gap-2">
          <BaseIcon name="Calendar" class="h-4 w-4 text-blue-400" />
          <span class="text-sm text-blue-700">Próxima cobrança em <strong>{{ formatDate(nextBilling.date) }}</strong></span>
        </div>
        <span class="text-sm font-semibold text-blue-700">{{ formatCurrency(nextBilling.amount) }}</span>
      </div>

      <!-- Tabela de invoices -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <BaseIcon name="DocumentText" class="h-4 w-4 text-gray-400" />
          <div>
            <p class="text-sm font-semibold text-gray-800">Histórico de faturas</p>
            <p class="text-xs text-gray-400">Últimas cobranças da sua assinatura</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingInvoices" class="divide-y divide-gray-100">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-4 py-4">
            <div class="h-3 w-20 animate-pulse rounded bg-gray-100" />
            <div class="h-3 w-32 animate-pulse rounded bg-gray-100" />
            <div class="ml-auto h-3 w-16 animate-pulse rounded bg-gray-100" />
            <div class="h-5 w-12 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>

        <!-- Invoices -->
        <div v-else-if="invoices.length" class="divide-y divide-gray-100">
          <div
            v-for="invoice in invoices"
            :key="invoice.id"
            class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-gray-50/60"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-800">{{ formatPeriod(invoice.period_start, invoice.period_end) }}</p>
              <p class="text-xs text-gray-400">{{ formatDate(invoice.created) }} · Nº {{ invoice.number || invoice.id.slice(-8).toUpperCase() }}</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(invoice.amount_paid || invoice.amount_due) }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="{
                'bg-green-50 text-green-600': invoice.status === 'paid',
                'bg-amber-50 text-amber-600': invoice.status === 'open',
                'bg-gray-100 text-gray-500':  invoice.status === 'void' || invoice.status === 'uncollectible',
                'bg-red-50 text-red-500':     invoice.status === 'draft'
              }"
            >{{ invoiceStatusLabel(invoice.status) }}</span>
            <a
              v-if="invoice.invoice_pdf"
              :href="invoice.invoice_pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-700"
            >
              <BaseIcon name="ArchiveBox" class="h-3.5 w-3.5" />
              PDF
            </a>
          </div>
        </div>

        <!-- Empty: plano gratuito ou sem invoices -->
        <div v-else class="flex flex-col items-center gap-1 px-4 py-10 text-center">
          <BaseIcon name="DocumentText" class="h-6 w-6 text-gray-300" />
          <p class="text-sm font-medium text-gray-500">Nenhuma fatura encontrada</p>
          <p class="text-xs text-gray-400">Faturas aparecerão aqui após a primeira cobrança da sua assinatura.</p>
        </div>
      </div>

    </div>

    <!-- Tab: Plano -->
    <div v-show="activeTab === 'plano'" class="space-y-4">

      <!-- Assinatura (admin) -->
      <div v-if="$can.canAccess('admin')" class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <BaseIcon name="BankNotes" class="h-4 w-4 text-gray-400" />
          <div>
            <p class="text-sm font-semibold text-gray-800">Assinatura</p>
            <p class="text-xs text-gray-400">Gerencie seu plano e cobrança</p>
          </div>
        </div>
        <div class="divide-y divide-gray-100">
          <div class="flex items-center gap-3 px-4 py-3">
            <span class="text-xs font-medium text-gray-500">Plano atual</span>
            <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">{{ planStore?.name || 'Gratuito' }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-3">
            <span class="text-xs font-medium text-gray-500">Status</span>
            <span class="flex items-center gap-1.5 text-sm font-medium" :class="user?.status === 'active' ? 'text-green-600' : 'text-red-500'">
              <span class="h-1.5 w-1.5 rounded-full" :class="user?.status === 'active' ? 'bg-green-500' : 'bg-red-500'" />
              {{ user?.status === 'active' ? 'Ativo' : 'Bloqueado' }}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-2 p-4 sm:flex-row">
          <button
            v-if="planStore.name !== 'Business'"
            class="flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            @click="() => planStore.setOpen('upgrade')"
          >
            <BaseIcon name="star" class="h-4 w-4" />
            Mudar de Plano
          </button>
          <button
            v-if="authStore.isOwner"
            class="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:border-red-200 hover:text-red-600"
            @click="deleteAccount"
          >
            Cancelar assinatura
          </button>
        </div>
      </div>

      <!-- Limites do Plano -->
      <PlanLimitsWidget />

    </div>

    <UserForm />
    <CompanyForm />

  </template>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import PinInput from '@/components/form/PinInput';
import FormInput from '@/components/form/Input.vue';
import UserForm from '@/modules/users/views/user/Form';
import CompanyForm from '@/modules/users/views/company/Form';
import RatingStars from '@/components/rating/Star';
import PlanLimitsWidget from '@/components/plan/PlanLimitsWidget';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import { useAuthStore } from '@/modules/auth/store';
import { useUserStore } from '@/modules/users/store/user';
import { useCompanyStore } from '@/modules/users/store/company';

export default {
  name: 'MyAccount',
  components: {
    BaseButton,
    BaseIcon,
    FormInput,
    UserForm,
    CompanyForm,
    RatingStars,
    SkeletonRows,
    PlanLimitsWidget,
    PinInput
  },
  props: {
    hideHeader: { type: Boolean, default: false }
  },
  data() {
    return {
      activeTab: 'perfil',
      user: null,
      downloading: false,
      downloadingBackup: false,
      savingPassword: false,
      passwordError: '',
      passwordSuccess: '',
      passwordForm: {
        current: '',
        password: '',
        confirmation: ''
      },
      pinStep: 1,
      savingPin: false,
      pinError: '',
      pinSuccess: '',
      pinForm: { pin: '', confirmation: '' },
      invoices: [],
      nextBilling: null,
      loadingInvoices: false
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    userStore: () => useUserStore(),
    companyStore: () => useCompanyStore(),
    groupedResponsibilities() {
      const groups = {};
      (this.user?.responsibilities || []).forEach(resp => {
        const team = resp.team?.name;
        if (!groups[team]) groups[team] = [];
        groups[team].push(resp.position?.name);
      });
      return Object.entries(groups).map(([team, positions]) => ({ team, positions }));
    },
    tabs() {
      const list = [
        { id: 'perfil',    label: 'Perfil',    icon: 'User'       },
        { id: 'seguranca', label: 'Segurança', icon: 'LockClosed' }
      ];
      if (this.$can.canAccess('admin')) {
        list.push({ id: 'plano',        label: 'Plano',        icon: 'BankNotes'   });
        list.push({ id: 'faturamento',  label: 'Faturamento',  icon: 'DocumentText' });
      }
      return list;
    }
  },
  watch: {
    activeTab(tab) {
      if (tab === 'faturamento' && !this.invoices.length && !this.loadingInvoices) {
        this.fetchInvoices();
      }
    }
  },
  mounted() {
    this.fetchUser();
  },
  methods: {
    fetchUser() {
      this.axios
        .get(`/users/${this.authStore.user.id}/me`)
        .then(response => (this.user = response))
        .catch(() => (this.user = null));
    },
    editUser() {
      this.userStore.setUser(this.user);
      this.drawerStore.setDrawer({
        title: 'Editar perfil',
        context: 'user',
        open: true,
        onSave: () => this.fetchUser()
      });
    },
    editCompany() {
      this.companyStore.setCompany(this.user.company);
      this.drawerStore.setDrawer({
        title: 'Editar Instituição',
        context: 'company',
        open: true,
        onSave: () => this.fetchUser()
      });
    },
    resetPinForm() {
      this.pinStep = 1;
      this.pinError = '';
      this.pinSuccess = '';
      this.pinForm = { pin: '', confirmation: '' };
      this.$nextTick(() => this.$refs.pinNewRef?.reset());
    },

    async savePin() {
      if (this.pinForm.pin !== this.pinForm.confirmation) {
        this.pinError = 'Os PINs não conferem.';
        this.$nextTick(async () => {
          await new Promise(r => setTimeout(r, 800));
          this.resetPinForm();
        });
        return;
      }

      this.savingPin = true;
      this.pinError  = '';
      try {
        await this.axios.patch('/users/update_pin', { pin: this.pinForm.pin });
        this.pinSuccess = 'PIN atualizado com sucesso!';
        if (this.user) this.user.pinConfigured = true;
        this.resetPinForm();
      } catch (error) {
        this.pinError = error?.response?.data?.error || 'Erro ao salvar PIN.';
        this.resetPinForm();
      } finally {
        this.savingPin = false;
      }
    },

    async savePassword() {
      this.passwordError = '';
      this.passwordSuccess = '';

      if (this.passwordForm.password.length < 8) {
        this.passwordError = 'A senha deve ter no mínimo 8 caracteres.';
        return;
      }
      if (this.passwordForm.password !== this.passwordForm.confirmation) {
        this.passwordError = 'As senhas não conferem.';
        return;
      }

      this.savingPassword = true;
      try {
        const skipCurrentPassword =
          this.authStore.loginMethod === 'magic_link' ||
          this.authStore.loginMethod === 'google' ||
          !this.user?.hasPassword;

        await this.axios.patch('/users/update_password', {
          password: this.passwordForm.password,
          password_confirmation: this.passwordForm.confirmation,
          current_password: this.passwordForm.current,
          skip_current_password: skipCurrentPassword
        });

        this.passwordSuccess = 'Senha atualizada com sucesso!';
        this.passwordForm = { current: '', password: '', confirmation: '' };
        if (this.user) this.user.hasPassword = true;
      } catch (err) {
        this.passwordError = err?.response?.data?.error || 'Erro ao atualizar a senha.';
      } finally {
        this.savingPassword = false;
      }
    },
    async downloadData() {
      this.downloading = true;
      try {
        const response = await this.axios.get('/users/data_export');
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meus-dados-rosterpro-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        this.notificationStore.addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível exportar seus dados. Tente novamente.'
        });
      } finally {
        this.downloading = false;
      }
    },
    async downloadBackup() {
      this.downloadingBackup = true;
      try {
        const response = await this.axios.get('/users/account_backup');
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-rosterpro-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        this.notificationStore.addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível gerar o backup. Tente novamente.'
        });
      } finally {
        this.downloadingBackup = false;
      }
    },
    async fetchInvoices() {
      this.loadingInvoices = true;
      try {
        const res = await this.axios.get('/billing/invoices');
        this.invoices = res.invoices || [];
        this.nextBilling = res.next_billing || null;
      } catch {
        this.notificationStore.addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível carregar o histórico de faturas.'
        });
      } finally {
        this.loadingInvoices = false;
      }
    },
    formatDate(unix) {
      if (!unix) return '—';
      return new Date(unix * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    formatPeriod(start, end) {
      if (!start || !end) return '—';
      const s = new Date(start * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const e = new Date(end * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${s} – ${e}`;
    },
    formatCurrency(cents) {
      if (cents == null) return '—';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    },
    invoiceStatusLabel(status) {
      return { paid: 'Pago', open: 'Em aberto', void: 'Cancelada', uncollectible: 'Inadimplente', draft: 'Rascunho' }[status] || status;
    },
    deleteAccount() {
      if (!this.authStore.isOwner) return;

      this.confirmationStore.setConfirmation({
        title: 'Cancelar conta',
        open: true,
        color: 'blue',
        confirmText: 'Quero continuar usando o Roster Pro',
        cancelText: 'Cancelar minha conta ',
        description: `
<div class="space-y-4 text-sm text-gray-700">
  <p class="text-base">
    Entendemos que, às vezes, é preciso dar uma pausa.
    Antes de continuar, veja exatamente o que acontece ao cancelar sua conta.
  </p>

  <div class="rounded border border-red-200 bg-red-50 p-4">
    <h4 class="font-semibold text-red-700 mb-2">O que será removido:</h4>
    <ul class="list-disc pl-5 space-y-1 text-red-700">
      <li>Vagas publicadas e rascunhos</li>
      <li>Candidaturas e pipelines</li>
      <li>Histórico de recrutamento</li>
      <li>Notificações e mensagens</li>
    </ul>
  </div>

  <div class="rounded border border-yellow-200 bg-yellow-50 p-4">
    <h4 class="font-semibold text-yellow-700 mb-2">Período de segurança (30 dias)</h4>
    <p>Sua conta ficará desativada sem cobrança. Se você <strong>fizer login novamente</strong>, o cancelamento será automaticamente interrompido.</p>
  </div>

  <div class="rounded border border-gray-200 bg-gray-50 p-4">
    <p>Antes de ir, nossa equipe pode ajudar. Muitas vezes, um pequeno ajuste resolve o problema.</p>
  </div>

  <p class="text-xs text-gray-500">Ao confirmar, você declara estar ciente desses impactos.</p>
</div>
        `,
        onCancel: () => {
          this.axios
            .post('/users/delete')
            .then(() => {
              this.authStore.logout();
              this.$router.replace({ path: '/' });
            })
            .catch(() => {
              this.notificationStore.addNotification({
                type: 'error',
                title: 'Erro',
                message: 'Houve um erro ao tentar cancelar sua conta. Tente novamente mais tarde.'
              });
            });
          this.confirmationStore.close();
        },
        onConfirm: () => this.confirmationStore.close()
      });
    }
  }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
