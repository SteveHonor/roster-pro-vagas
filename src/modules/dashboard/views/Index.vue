<template>
  <div class="space-y-6">

    <!-- Header da organização -->
    <div v-if="companyStore.hasCompany">
      <h1 class="text-xl font-bold text-slate-800">{{ companyStore.getChosenCompany?.name }}</h1>
      <p class="text-sm text-slate-400">{{ formatarDocument(companyStore.getChosenCompany?.document) }}</p>
    </div>

    <!-- WhatsApp banner: upsell (Free) ou ativação (Essential+) -->
    <div
v-if="showWaBanner" class="flex items-center justify-between gap-4 rounded-md border px-5 py-4" :class="canUseWhatsApp
      ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white'
      : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white'">
      <div class="flex items-center gap-3">
        <div
class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          :class="canUseWhatsApp ? 'bg-emerald-500' : 'bg-emerald-500'">
          <BaseIcon name="WhatsApp" class="!h-5 !w-5 text-white" />
          <span
v-if="!canUseWhatsApp"
            class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500">
            <BaseIcon name="LockClosed" class="!h-2.5 !w-2.5 text-white" />
          </span>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">
            {{ canUseWhatsApp ? 'Ative notificações via WhatsApp' : 'WhatsApp disponível no Essential' }}
          </p>
          <p class="text-xs text-gray-500">
            {{ canUseWhatsApp
              ? 'Confirme escalas em 1 toque e receba lembretes direto no celular — sem abrir o app.'
              : 'Notifique seu time pelo canal que todos já usam. 95% de taxa de abertura vs 22% do e-mail.' }}
          </p>
        </div>
      </div>
      <div class="flex flex-shrink-0 items-center gap-2">
        <button
v-if="canUseWhatsApp" type="button"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
          @click="activateWa">
          Ativar agora
        </button>
        <button
v-else type="button"
          class="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600"
          @click="planStore.setOpen('upgrade')">
          Ver planos
        </button>
        <button
type="button" class="rounded-lg p-2 text-gray-400 hover:text-gray-600" title="Dispensar"
          @click="dismissWaBanner">
          <BaseIcon name="XMark" class="!h-4 !w-4" />
        </button>
      </div>
    </div>

    <!-- Banner: relatórios pós-evento pendentes -->
    <div
      v-if="$can.canAccess('operator') && pendingReportsCount > 0"
      class="flex items-center justify-between gap-4 rounded-md border border-orange-200 bg-orange-50 px-5 py-4"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
          <BaseIcon name="document-text" class="!size-4 text-orange-500" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">
            {{ pendingReportsCount }} {{ pendingReportsCount === 1 ? 'relatório pós-evento pendente' : 'relatórios pós-evento pendentes' }}
          </p>
          <p class="text-xs text-slate-500">
            Preencha os relatórios para registrar presença, avaliações e observações dos eventos passados.
          </p>
        </div>
      </div>
      <router-link
        to="/calendar?tab=history"
        class="flex-shrink-0 rounded-md bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
      >
        Ver relatórios
      </router-link>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="h-2.5 w-24 rounded bg-slate-200"></div>
            <div class="h-4 w-4 rounded bg-slate-200"></div>
          </div>
          <div class="mt-3 h-8 w-16 rounded bg-slate-200"></div>
          <div class="mt-1.5 h-2.5 w-20 rounded bg-slate-200"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="kpi in kpis" :key="kpi.label" class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-medium uppercase tracking-wide text-slate-400">{{ kpi.label }}</span>
            <BaseIcon :name="kpi.icon" class="!size-4 text-slate-300" />
          </div>
          <p class="mt-2 text-3xl font-bold text-slate-800">{{ kpi.value ?? '—' }}</p>
          <p class="mt-0.5 text-xs text-slate-400">{{ kpi.description }}</p>
        </div>
      </template>
    </div>

    <!-- Broadcast banners -->
    <div v-if="!loading && activeBroadcasts.length" class="flex flex-col gap-2">
      <div v-for="msg in activeBroadcasts.slice(0, 3)" :key="msg.id" class="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <BaseIcon name="megaphone" class="!size-3.5 text-blue-500" />
            <span class="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Comunicado</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>de <strong class="text-slate-500">{{ msg.senderName }}</strong></span>
            <span>·</span>
            <span>Expira {{ moment(msg.visibleUntil).format('DD/MM') }}</span>
          </div>
        </div>
        <p class="text-sm text-slate-700">{{ msg.content }}</p>
      </div>
      <router-link
        v-if="activeBroadcasts.length > 3"
        to="/calendar?tab=broadcasts"
        class="flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
      >
        Ver todos os comunicados ({{ activeBroadcasts.length }})
        <BaseIcon name="ChevronRight" class="!size-3.5" />
      </router-link>
    </div>

    <!-- Próximos Eventos -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Calendar" class="!size-4 text-slate-400" />
        Próximos eventos
      </h2>

      <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        <div v-for="i in 3" :key="i" class="flex flex-col gap-2 rounded-md border border-slate-100 bg-slate-50 p-3">
          <div class="h-4 w-3/4 rounded bg-slate-200"></div>
          <div class="h-3 w-1/2 rounded bg-slate-200"></div>
          <div class="flex items-center justify-between">
            <div class="h-3 w-20 rounded bg-slate-200"></div>
            <div class="h-6 w-20 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>

      <div v-else-if="events.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
v-for="(eventDay, index) in events" :key="index"
          class="flex flex-col gap-2 rounded-md border border-slate-100 bg-slate-50 p-3">
          <span class="truncate text-sm font-semibold capitalize text-slate-800">{{ eventDay.event.name }}</span>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <BaseIcon name="Calendar" class="!size-3.5 text-slate-400" />
            <span>{{ eventDay.event.day }}</span>
            <span class="text-slate-300">·</span>
            <span>{{ eventDay.event.time }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-slate-400">
              <strong class="text-slate-600">{{ eventDay.totalCollaborators }}</strong> colaboradores
            </span>
            <button
              class="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              @click="scale(eventDay.eventDayId)">
              <BaseIcon name="ChevronRight" class="!size-3" />
              Ver escala
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-start gap-5 py-6 sm:flex-row sm:items-center sm:gap-10">
        <!-- Estado vazio: eventos -->
        <div class="flex flex-col items-center gap-2 text-center sm:w-1/3 sm:flex-shrink-0">
          <BaseIcon name="Calendar" class="!size-10 text-slate-200" />
          <p class="text-sm font-semibold text-slate-500">Nenhum evento futuro</p>
          <p class="text-xs text-slate-400">Crie uma agenda para começar a escalar</p>
        </div>

        <!-- Tip -->
        <div class="flex-1 rounded-md border border-blue-100 bg-blue-50 px-5 py-4">
          <p class="mb-3 text-[11px] font-bold uppercase tracking-wider text-blue-400">Como funciona</p>
          <ol class="space-y-2.5">
            <li class="flex items-start gap-2.5">
              <span
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">1</span>
              <span class="text-xs text-slate-700">Crie uma agenda — pontual ou recorrente — no
                <strong>Calendário</strong></span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
              <span class="text-xs text-slate-700">Monte a escala: distribua colaboradores nas equipes e posições
                certas</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">3</span>
              <span class="text-xs text-slate-700">Publique — seu time é notificado automaticamente e pode confirmar
                presença</span>
            </li>
          </ol>
          <router-link
to="/calendar/new"
            class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
            Criar primeira agenda
            <BaseIcon name="ChevronRight" class="!h-3 !w-3" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Linha: Minhas Escalas + Últimas Mensagens -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">

      <!-- Minhas Escalas -->
      <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BaseIcon name="QueueList" class="!size-4 text-slate-400" />
          Minhas escalas
        </h2>
        <SkeletonRows v-if="loading" :rows="2" />
        <div v-else-if="schedules.length" class="flex flex-col gap-2">
          <div
v-for="value in schedules" :key="value.schedule_id"
            class="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
            <div class="flex items-center gap-2">
              <BaseIcon name="Calendar" class="!size-4 text-slate-400" />
              <div>
                <p class="text-sm font-medium text-slate-700">{{ value.event }}</p>
                <p class="text-[11px] text-slate-400">{{ value.day }} · {{ value.time }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-4 py-5">
          <div class="flex flex-col items-center gap-1 text-center">
            <BaseIcon name="QueueList" class="!size-8 text-slate-200" />

            <p class="text-sm font-semibold text-slate-500">Sem escalas futuras</p>
          </div>
          <div class="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Quando você for adicionado como colaborador em uma escala, ela aparecerá aqui com data, horário e evento.
          </div>
        </div>
      </div>

      <!-- Últimas Mensagens -->
      <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BaseIcon name="Chat" class="!size-4 text-slate-400" />
          Últimas mensagens
        </h2>
        <SkeletonRows v-if="loading" :rows="2" />
        <div v-else-if="messageStore.messages.length" class="flex flex-col gap-2">
          <CardRow v-for="(message, index) in [...messageStore.messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)" :key="index" accent="border-l-2 border-l-blue-400">
            <p class="line-clamp-2 text-sm text-slate-700">{{ message.content }}</p>
            <p class="mt-1 text-[11px] text-slate-400">
              Expira em {{ moment(message.visibleUntil).format('DD/MM/YY') }}
            </p>
          </CardRow>
          <router-link
            v-if="messageStore.messages.length > 3"
            to="/calendar?tab=broadcasts"
            class="flex items-center justify-center gap-1 rounded-md border border-slate-200 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50"
          >
            Ver todas ({{ messageStore.messages.length }})
            <BaseIcon name="ChevronRight" class="!size-3.5" />
          </router-link>
        </div>
        <div v-else class="flex flex-col items-center gap-4 py-5">
          <div class="flex flex-col items-center gap-1 text-center">
            <BaseIcon name="Chat" class="!size-8 text-slate-200" />

            <p class="text-sm font-semibold text-slate-500">Nenhuma mensagem</p>
          </div>
          <div class="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <p>Envie comunicados, avisos e lembretes direto para sua equipe — sem sair da plataforma.</p>
            <router-link
v-if="isOperator" to="/calendar?tab=broadcasts"
              class="mt-2 inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline">
              Enviar mensagem
              <BaseIcon name="ChevronRight" class="!h-3 !w-3" />
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights inteligentes (Pro+) -->
    <div v-if="isOperator && insights" class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Sparkles" class="!size-4 text-amber-400" />
        Insights inteligentes
        <span class="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">IA</span>
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Colaboradores em risco -->
        <div>
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Baixa taxa de aceite</p>
          <div v-if="insights.at_risk_users?.length" class="flex flex-col gap-1.5">
            <div
v-for="u in insights.at_risk_users" :key="u.id"
              class="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-3 py-2">
              <span class="truncate text-sm font-medium text-slate-700">{{ u.name }}</span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-slate-400">{{ u.total_invitations }} convites</span>
                <span class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                  {{ u.acceptance_rate }}%
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-400">Nenhum colaborador em risco nos últimos 60 dias.</p>
        </div>

        <!-- Cobertura insuficiente -->
        <div>
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cobertura insuficiente</p>
          <div v-if="insights.coverage_alerts?.length" class="flex flex-col gap-1.5">
            <div
v-for="alert in insights.coverage_alerts" :key="alert.event_day_id"
              class="flex items-center justify-between rounded-md border border-amber-100 bg-amber-50 px-3 py-2">
              <div class="min-w-0">
                <span class="truncate text-sm font-medium text-slate-700">{{ alert.event_name }}</span>
                <span class="block text-[11px] text-slate-400">{{ alert.date }}</span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-xs text-slate-400">{{ alert.accepted }}/{{ alert.total }}</span>
                <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  {{ alert.coverage }}%
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-400">Todos os eventos com boa cobertura nos próximos 30 dias.</p>
        </div>
      </div>
    </div>

    <!-- Engajamento do time — dados reais (Pro+) -->
    <div v-if="isOperator && engagement" class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Clock" class="!size-4 text-blue-400" />
        Engajamento do time
      </h2>

      <!-- KPIs de tempo médio -->
      <div class="mb-4 grid grid-cols-3 gap-3">
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Confirmação de escala</p>
          <p class="mt-1 text-xl font-bold" :class="engagementConfirmClass">
            {{ formatHours(engagement.averages.avg_confirmation_hours) }}
          </p>
          <p class="text-[11px] text-slate-400">tempo médio de resposta</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Feedback pós-evento</p>
          <p class="mt-1 text-xl font-bold" :class="engagementFeedbackClass">
            {{ formatHours(engagement.averages.avg_feedback_hours) }}
          </p>
          <p class="text-[11px] text-slate-400">tempo médio para avaliar</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Aceite de troca</p>
          <p class="mt-1 text-xl font-bold text-slate-700">
            {{ formatHours(engagement.averages.avg_swap_hours) }}
          </p>
          <p class="text-[11px] text-slate-400">tempo médio para aceitar</p>
        </div>
      </div>

      <!-- Resposta lenta por colaborador -->
      <div>
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Colaboradores lentos para responder</p>
        <div v-if="engagement.slow_responders?.length" class="flex flex-col gap-1.5">
          <div
            v-for="u in engagement.slow_responders"
            :key="u.id"
            class="flex items-center justify-between rounded-md border border-orange-100 bg-orange-50 px-3 py-2"
          >
            <span class="truncate text-sm font-medium text-slate-700">{{ u.name }}</span>
            <div class="flex flex-shrink-0 items-center gap-2">
              <span v-if="u.avg_confirmation_hours" class="text-[11px] text-slate-500">
                escala: <strong class="text-orange-600">{{ formatHours(u.avg_confirmation_hours) }}</strong>
              </span>
              <span v-if="u.avg_confirmation_hours && u.avg_feedback_hours" class="text-slate-300">·</span>
              <span v-if="u.avg_feedback_hours" class="text-[11px] text-slate-500">
                feedback: <strong class="text-orange-600">{{ formatHours(u.avg_feedback_hours) }}</strong>
              </span>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400">Todos respondendo dentro do esperado nos últimos 60 dias.</p>
      </div>
    </div>

    <!-- Engajamento do time — upsell (planos sem smart_insights) -->
    <div
      v-else-if="isOperator && !canSmartInsights"
      class="relative overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-sm"
    >
      <!-- Header -->
      <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Clock" class="!size-4 text-blue-400" />
        Engajamento do time
      </h2>

      <!-- Preview desfocado -->
      <div class="mb-4 grid select-none grid-cols-3 gap-3 blur-sm">
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Confirmação de escala</p>
          <p class="mt-1 text-xl font-bold text-slate-700">6h</p>
          <p class="text-[11px] text-slate-400">tempo médio de resposta</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Feedback pós-evento</p>
          <p class="mt-1 text-xl font-bold text-red-500">3 dias</p>
          <p class="text-[11px] text-slate-400">tempo médio para avaliar</p>
        </div>
        <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Aceite de troca</p>
          <p class="mt-1 text-xl font-bold text-slate-700">12h</p>
          <p class="text-[11px] text-slate-400">tempo médio para aceitar</p>
        </div>
      </div>

      <!-- CTA sobreposto -->
      <div class="flex items-center justify-between gap-4 rounded-md border border-orange-100 bg-orange-50 px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
            <BaseIcon name="LockClosed" class="!size-4 text-orange-500" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">Identifique quem está travando seu fluxo</p>
            <p class="text-xs text-slate-500">Veja o tempo médio de cada colaborador para confirmar escalas, dar feedback e aceitar trocas.</p>
          </div>
        </div>
        <button
          type="button"
          class="flex-shrink-0 rounded-md bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
          @click="planStore.setOpen('upgrade')"
        >
          Ver planos
        </button>
      </div>
    </div>

    <!-- Últimas Avaliações -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Star" class="!size-4 text-slate-400" />
        Últimas avaliações
      </h2>
      <SkeletonRows v-if="loading" :rows="2" has-trailing />
      <div v-else-if="evaluations.length" class="flex flex-col gap-2">
        <div
v-for="(evaluation, index) in evaluations" :key="index"
          class="rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-slate-800">{{ evaluation.reviewed }}</span>
            <RatingStars :rating="evaluation.rating" :background="false" mode="stars" />
          </div>
          <p v-if="evaluation.comment" class="mt-1.5 text-sm text-slate-600">{{ evaluation.comment }}</p>
          <p class="mt-1 text-[11px] text-slate-400">por {{ evaluation.reviewer }}</p>
        </div>
      </div>
      <div v-else class="flex flex-col items-start gap-5 py-6 sm:flex-row sm:items-center sm:gap-10">
        <div class="flex flex-col items-center gap-2 text-center sm:w-48 sm:flex-shrink-0">
          <BaseIcon name="Star" class="!size-10 text-slate-200" />
          <p class="text-sm font-semibold text-slate-500">Nenhuma avaliação</p>
          <p class="text-xs text-slate-400">Ainda não há registros</p>
        </div>
        <div class="flex-1 rounded-md border border-amber-100 bg-amber-50 px-5 py-4">
          <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-400">Como funciona</p>
          <p class="text-xs text-slate-600">
            Após cada evento, você pode avaliar o desempenho de cada colaborador escalado. As avaliações ficam
            registradas no perfil do colaborador e ajudam a compor o histórico do time.
          </p>
          <p class="mt-2 text-xs text-slate-500">
            Acesse qualquer evento concluído no <strong>Calendário</strong> para registrar avaliações.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import RatingStars from '@/components/rating/Star';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

import { mapActions } from 'pinia';
import { useDashboardStore } from '@/modules/dashboard/store';
import { useMessageStore } from '@/modules/calendar/store/message';
import { useCompanyStore } from '@/modules/users/store/company';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';
import { can } from '@/helper/can';

const WA_BANNER_KEY = 'wa_dashboard_banner_dismissed';

export default {
  components: { BaseIcon, CardRow, RatingStars, SkeletonRows },
  data() {
    return {
      loading: true,
      totals: {},
      events: [],
      schedules: [],
      evaluations: [],
      insights: null,
      engagement: null,
      pendingReportsCount: 0,
      waBannerDismissed: localStorage.getItem(WA_BANNER_KEY) === '1'
    };
  },
  computed: {
    companyStore: () => useCompanyStore(),
    messageStore: () => useMessageStore(),
    eventDayStore: () => useEventDayStore(),
    authStore: () => useAuthStore(),
    planStore: () => usePlanStore(),
    canUseWhatsApp() {
      return can().canView('whatsapp');
    },
    whatsappOptedIn() {
      return useAuthStore().whatsappOptedIn;
    },
    showWaBanner() {
      if (this.loading) return false;
      if (this.waBannerDismissed) return false;
      if (this.canUseWhatsApp) return !this.whatsappOptedIn;
      return true; // Free: sempre mostra como upsell
    },
    isOperator() {
      return can().canAccess('operator');
    },
    canSmartInsights() {
      return can().canView('smartInsights');
    },
    activeBroadcasts() {
      const now = this.moment();
      return this.messageStore.messages
        .filter(m => this.moment(m.visibleUntil).isAfter(now))
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    engagementConfirmClass() {
      const h = this.engagement?.averages?.avg_confirmation_hours;
      if (!h) return 'text-slate-700';
      return h > 24 ? 'text-red-600' : h > 12 ? 'text-orange-500' : 'text-emerald-600';
    },
    engagementFeedbackClass() {
      const h = this.engagement?.averages?.avg_feedback_hours;
      if (!h) return 'text-slate-700';
      return h > 72 ? 'text-red-600' : h > 48 ? 'text-orange-500' : 'text-emerald-600';
    },
    kpis() {
      return [
        { label: 'Eventos futuros', description: 'Aguardando realização', value: this.totals.open, icon: 'Calendar' },
        { label: 'Eventos realizados', description: 'Histórico concluído', value: this.totals.closed, icon: 'Check' },
        { label: 'Horas trabalhadas', description: 'Total acumulado', value: this.totals.hours, icon: 'Clock' },
        { label: 'Colaboradores', description: 'Usuários ativos', value: this.totals.users, icon: 'Users' }
      ];
    }
  },
  async mounted() {
    try {
      const requests = [
        this.axios.get('/dashboard/totals'),
        this.axios.get('/dashboard/events'),
        this.axios.get('/dashboard/schedules'),
        this.axios.get('/dashboard/evaluations')
      ];

      if (this.isOperator && can().canView('smartInsights')) {
        requests.push(this.axios.get('/dashboard/insights').catch(() => null));
        requests.push(this.axios.get('/dashboard/engagement').catch(() => null));
      }

      const [totalsResponse, eventsResponse, schedulesResponse, evaluationsResponse, insightsResponse, engagementResponse] = await Promise.all(requests);

      this.totals = totalsResponse;
      this.events = eventsResponse;
      this.schedules = schedulesResponse;
      this.evaluations = evaluationsResponse;
      if (insightsResponse) this.insights = insightsResponse;
      if (engagementResponse) this.engagement = engagementResponse;

      if (this.$can.canAccess('operator')) {
        this.axios.get('events/pending_reports_count')
          .then(data => { this.pendingReportsCount = data.count || 0; })
          .catch(() => {});
      }

      await this.getMessages();

      this.breadcrumbStore.setBreadcrumb([{ name: 'Dashboard', path: '/' }]);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    scale(eventDayId) {
      this.$router.push(`calendar/${eventDayId}/scale`);
    },
    formatarDocument(valor) {
      if (!valor) return '';
      const n = valor.toString().replace(/\D/g, '');
      if (n.length === 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      if (n.length === 14) return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      return valor;
    },
    dismissWaBanner() {
      localStorage.setItem(WA_BANNER_KEY, '1');
      this.waBannerDismissed = true;
    },
    activateWa() {
      this.$router.push({ path: '/settings', query: { tab: 'notifications', wa: '1' } });
    },
    formatHours(h) {
      if (h == null) return '—';
      if (h < 1) return '< 1h';
      if (h < 24) return `${Math.round(h)}h`;
      const days = Math.round(h / 24);
      return days === 1 ? '1 dia' : `${days} dias`;
    },
    async getMessages() {
      const response = await this.axios.get('broadcast_messages');
      this.messageStore.setMessages(response);
    },
    ...mapActions(useDashboardStore, ['loadShifts'])
  }
};
</script>
