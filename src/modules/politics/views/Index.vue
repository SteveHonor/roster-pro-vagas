<template>
  <div class="text-sale-800 min-h-screen">
    <div class="mx-auto">
      <!-- Header -->
      <header
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <router-link to="/" class="my-10 flex">
            <img src="@/assets/roster.png" alt="Roster Pro" class="w-40" />
          </router-link>

          <div class="mb-5 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <button
              class="sticky top-6 flex h-fit items-center gap-1 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm lg:col-span-1"
              @click="$router.back()"
            >
              <BaseIcon name="chevron-left" class="w-5" /> Voltar
            </button>
          </div>

          <p class="text-sm text-gray-500">
            Termos de Uso & Política de Privacidade (LGPD)
          </p>
          <p class="mt-1 text-xs text-gray-400">
            Última atualização: <strong>01/06/2026</strong>
          </p>
        </div>

        <div class="flex items-center gap-3 justify-self-end">
          <input
            v-model="search"
            type="search"
            placeholder="Pesquisar termos..."
            aria-label="Pesquisar termos"
            class="focus:ring-2 focus:ring-gray-300 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
          />

          <BaseButton
            @click="toggleCompact"
          >
            {{ compact ? 'Expandir' : 'Compactar' }}
          </BaseButton>

          <button
            class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-100"
            @click="printPage"
          >
            Imprimir
          </button>
        </div>
      </header>

      <!-- Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <!-- Sidebar / TOC -->
        <nav
          class="sticky top-6 h-fit rounded-lg bg-white p-4 shadow-sm lg:col-span-1"
          role="navigation"
          aria-label="Sumário"
        >
          <h2 class="mb-3 text-sm font-semibold">Sumário</h2>

          <ul class="space-y-2 text-sm">
            <li v-for="item in tocFiltered" :key="item.id">
              <a
                :href="'#' + item.id"
                class="text-gray-600 hover:underline"
                @click.prevent="scrollTo(item.id)"
              >
                {{ item.title }}
              </a>
            </li>
          </ul>

          <div
            class="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500"
          >
            <p><strong>Planos:</strong> Free • Essential • Pro • Business</p>
            <p><strong>Pagamento:</strong> Stripe</p>
            <p>
              <strong>Contato:</strong>
              <a :href="'mailto:' + contactEmail" class="text-gray-600">
                {{ contactEmail }}
              </a>
            </p>
          </div>
        </nav>

        <!-- Content -->
        <main class="space-y-6 lg:col-span-3">
          <!-- Terms -->
          <section
            :id="sections.terms.id"
            class="rounded-lg bg-white p-6 shadow-sm"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="mb-1 text-lg font-semibold">
                  {{ sections.terms.title }}
                </h2>
                <p class="text-sm text-gray-500">
                  Ao usar a plataforma, você concorda com estes termos.
                </p>
              </div>
              <span class="text-xs text-gray-400">
                Última atualização: 01/06/2026
              </span>
            </div>

            <div
              class="prose mt-4 max-w-none space-y-4"
              v-html="renderedContent(sections.terms)"
            ></div>
          </section>

          <!-- Privacy -->
          <section
            :id="sections.privacy.id"
            class="rounded-lg bg-white p-6 shadow-sm"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="mb-1 text-lg font-semibold">
                  {{ sections.privacy.title }}
                </h2>
                <p class="text-sm text-gray-500">
                  Como tratamos seus dados (LGPD).
                </p>
              </div>
              <span class="text-xs text-gray-400">
                Última atualização: 01/06/2026
              </span>
            </div>

            <div
              class="prose mt-4 max-w-none space-y-4"
              v-html="renderedContent(sections.privacy)"
            ></div>
          </section>

          <!-- Footer -->
          <section
            class="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm"
          >
            Legislação aplicável: Brasil — LGPD (Lei nº 13.709/2018). Foro:
            {{ cityUF }}.
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import DOMPurify from 'dompurify';
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'TermsPrivacy',
  components: {
    BaseButton,
    BaseIcon
  },
  data() {
    return {
      companyName: 'Roster Pro',
      contactEmail: 'contato@rosterpro.com.br',
      cityUF: 'Santarém - PA',

      search: '',
      compact: false,

      sections: {
        terms: {
          id: 'termos-de-uso',
          title: 'Termos de Uso',
          content: []
        },
        privacy: {
          id: 'politica-de-privacidade',
          title: 'Política de Privacidade (inclui LGPD)',
          content: []
        }
      }
    };
  },

  computed: {
    toc() {
      const list = [];

      for (const key in this.sections) {
        const section = this.sections[key];

        list.push({ id: section.id, title: section.title });

        for (const part of section.content) {
          const subId = `${section.id}-${this.slug(part.heading)}`;
          list.push({ id: subId, title: '— ' + part.heading });
        }
      }

      return list;
    },

    tocFiltered() {
      if (!this.search) return this.toc;
      const q = this.search.toLowerCase();
      return this.toc.filter(i => i.title.toLowerCase().includes(q));
    }
  },

  created() {
    // Conteúdo dos Termos
    this.sections.terms.content = [
      {
        heading: '1. Objeto',
        body: `<p>O Roster Pro é uma plataforma SaaS (Software como Serviço) desenvolvida e operada pela <strong>Honors Tecnologia Ltda</strong>, CNPJ 13.000.168/0001-13, voltada à gestão de escalas de trabalho para equipes e organizações. Ao utilizar a plataforma, você concorda integralmente com estes Termos de Uso e com nossa Política de Privacidade.</p>`
      },
      {
        heading: '2. Cadastro e Conta',
        body: `<p>Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras, completas e atualizadas. O usuário é responsável por:</p>
          <ul>
            <li>Manter a confidencialidade de sua senha.</li>
            <li>Todas as atividades realizadas com suas credenciais de acesso.</li>
            <li>Notificar o Roster Pro imediatamente em caso de acesso não autorizado, por e-mail: <a href="mailto:${this.contactEmail}">${this.contactEmail}</a>.</li>
          </ul>
          <p>A conta é pessoal e intransferível. Cada organização ("tenant") tem seus dados isolados e gerenciados de forma independente.</p>`
      },
      {
        heading: '3. Planos e Pagamentos',
        body: `<p>O Roster Pro oferece planos gratuitos e pagos. Nos planos pagos, pagamentos são processados exclusivamente via <strong>Stripe</strong>. Não armazenamos dados de cartão de crédito em nossos servidores.</p>
          <p>As condições de cada plano (funcionalidades, limites de usuários e preços) são descritas na página de Planos. Podemos alterar preços ou condições mediante comunicação prévia de 30 dias.</p>
          <p>Assinaturas pagas são renovadas automaticamente até que você cancele. O cancelamento pode ser feito nas configurações da conta.</p>`
      },
      {
        heading: '4. Uso Permitido e Proibido',
        body: `<p>Você pode usar o Roster Pro para gerenciar escalas e equipes de forma lícita.</p>
          <p>É expressamente proibido:</p>
          <ul>
            <li>Usar a plataforma para fins ilícitos ou fraudulentos.</li>
            <li>Realizar engenharia reversa, copiar ou reproduzir qualquer parte do software sem autorização escrita.</li>
            <li>Compartilhar credenciais de acesso com terceiros não autorizados.</li>
            <li>Tentar acessar dados de outros tenants ou usuários além dos seus próprios.</li>
            <li>Carregar, transmitir ou distribuir conteúdo que viole direitos de terceiros ou legislação vigente.</li>
            <li>Sobrecarregar deliberadamente a infraestrutura da plataforma.</li>
          </ul>`
      },
      {
        heading: '5. Propriedade Intelectual',
        body: `<p>Todo o código, design, marca, nome, logotipo e conteúdo da plataforma são propriedade exclusiva do Roster Pro. O uso da plataforma não confere ao usuário nenhum direito de propriedade sobre esses elementos. Os dados inseridos pelo usuário permanecem de sua propriedade, e o Roster Pro os trata conforme a Política de Privacidade.</p>`
      },
      {
        heading: '6. Limitação de Responsabilidade',
        body: `<p>A plataforma é fornecida "como está", sem garantia de funcionamento ininterrupto. Não nos responsabilizamos por:</p>
          <ul>
            <li>Interrupções causadas por falhas de terceiros (provedores de internet, energia, etc.).</li>
            <li>Perdas indiretas, lucros cessantes ou danos consequenciais decorrentes do uso da plataforma.</li>
            <li>Conteúdo inserido por usuários ou decisões de gestão tomadas com base nos dados da plataforma.</li>
          </ul>
          <p>Nossa responsabilidade total ficará limitada ao valor pago pelo usuário nos últimos 3 meses de assinatura.</p>`
      },
      {
        heading: '7. Suspensão e Encerramento',
        body: `<p>Podemos suspender ou encerrar sua conta em caso de violação destes Termos, fraude, uso indevido ou inadimplência, com ou sem aviso prévio dependendo da gravidade. Você pode encerrar sua conta a qualquer momento pelas configurações da plataforma. Após o encerramento, seus dados serão eliminados conforme nossa Política de Privacidade.</p>`
      },
      {
        heading: '8. Alterações dos Termos',
        body: `<p>Podemos alterar estes Termos mediante publicação atualizada nesta página e notificação por e-mail com antecedência mínima de 15 dias para mudanças materiais. O uso continuado da plataforma após a comunicação implica aceitação dos novos termos.</p>`
      },
      {
        heading: '9. Legislação Aplicável e Foro',
        body: `<p>Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de <strong>${this.cityUF}</strong> para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>`
      }
    ];

    // Conteúdo da Política de Privacidade
    this.sections.privacy.content = [
      {
        heading: '1. Compromisso e Escopo',
        body: `<p>O Roster Pro é desenvolvido e operado pela <strong>Honors Tecnologia Ltda</strong>, CNPJ 13.000.168/0001-13 ("nós", "nosso", "Controlador"). Estamos comprometidos com a proteção da sua privacidade e o tratamento responsável de dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong> — Lei nº 13.709/2018.</p>
          <p>Esta Política se aplica a todos os usuários da plataforma Roster Pro, incluindo administradores, operadores e colaboradores cadastrados por suas organizações.</p>`
      },
      {
        heading: '2. Dados Coletados e Por Que os Coletamos',
        body: `<p>Coletamos apenas os dados estritamente necessários para o funcionamento da plataforma:</p>
          <ul>
            <li><strong>Nome completo</strong> — Identificação do usuário nas escalas, relatórios e comunicações internas. <em>Base legal: Execução de contrato (Art. 7, V, LGPD).</em></li>
            <li><strong>E-mail</strong> — Login, convites de acesso, recuperação de senha e comunicações essenciais. <em>Base legal: Execução de contrato (Art. 7, V, LGPD).</em></li>
            <li><strong>Celular</strong> — Verificação de identidade e contato operacional. Quando o administrador habilita notificações WhatsApp e o usuário consente, o número é usado para envio de alertas via API do WhatsApp Business (Meta). O consentimento pode ser revogado a qualquer momento nas configurações de notificações. <em>Base legal: Execução de contrato e consentimento (Art. 7, I e V, LGPD).</em></li>
            <li><strong>CPF / CNPJ e dados da empresa</strong> — Identificação jurídica para fins cadastrais, emissão de documentos e gestão de assinatura. <em>Base legal: Execução de contrato e obrigação legal (Art. 7, II e V, LGPD).</em></li>
            <li><strong>Dados de escalas e avaliações</strong> — Registros de turnos, trocas de escala e avaliações de desempenho gerados pela operação da plataforma. <em>Base legal: Legítimo interesse e execução de contrato (Art. 7, V e IX, LGPD).</em></li>
            <li><strong>Cookies analíticos (Microsoft Clarity)</strong> — Análise de comportamento de uso no site de marketing, ativado apenas com consentimento explícito. <em>Base legal: Consentimento (Art. 7, I, LGPD).</em></li>
          </ul>`
      },
      {
        heading: '3. Compartilhamento de Dados',
        body: `<p><strong>Não vendemos seus dados pessoais.</strong> Compartilhamos informações apenas com os parceiros essenciais abaixo:</p>
          <ul>
            <li><strong>Stripe</strong> — processamento de pagamentos. O Stripe não armazena dados de cartão em nossos servidores.</li>
            <li><strong>Render Services, Inc. (render.com)</strong> — hospedagem da aplicação e banco de dados em servidores localizados nos <strong>Estados Unidos (Oregon)</strong>. Esta transferência internacional de dados se baseia nas garantias contratuais fornecidas pelo provedor (Art. 33, LGPD).</li>
            <li><strong>Microsoft Clarity</strong> — análise de comportamento no site (apenas com consentimento explícito).</li>
            <li><strong>Meta (WhatsApp Business API)</strong> — envio de notificações operacionais de escala quando habilitado pelo administrador e consentido pelo usuário. O número de celular é transmitido à API da Meta exclusivamente para entrega das mensagens.</li>
            <li><strong>Sistemas externos via API (planos Pro e Business)</strong> — ao gerar uma chave de API, o administrador autoriza que sistemas terceiros acessem dados de escalas, usuários e equipes da sua organização. O administrador é o responsável pelo uso adequado dessas integrações e pela informação aos titulares dos dados compartilhados.</li>
          </ul>`
      },
      {
        heading: '4. Retenção dos Dados',
        body: `<p>Retemos seus dados pelos seguintes períodos:</p>
          <ul>
            <li><strong>Dados de conta:</strong> enquanto a conta estiver ativa. Após solicitação de exclusão, os dados são mantidos por 30 dias (período de graça para reativação) e então eliminados permanentemente.</li>
            <li><strong>Registros de pagamento:</strong> 5 anos, conforme obrigação fiscal brasileira.</li>
            <li><strong>Logs de consentimento:</strong> pelo período necessário para cumprimento de obrigações legais.</li>
            <li><strong>Dados analíticos (Clarity):</strong> conforme a política de retenção da Microsoft.</li>
            <li><strong>Backups de infraestrutura:</strong> após a eliminação permanente dos dados de conta, cópias de segurança automáticas (point-in-time recovery) mantidas pelo provedor de hospedagem podem reter os dados por até 3 dias adicionais, antes de sua completa eliminação dos sistemas de recuperação.</li>
          </ul>`
      },
      {
        heading: '5. Segurança',
        body: `<p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo isolamento de dados por tenant (cada organização tem seus dados isolados), criptografia em trânsito (HTTPS/TLS), controle de acesso baseado em perfis (RBAC) e backups automáticos contínuos com recuperação em ponto no tempo (point-in-time recovery), garantindo resiliência e disponibilidade dos dados. Nenhum sistema é 100% invulnerável; em caso de incidente relevante, notificaremos os titulares conforme exige a LGPD.</p>`
      },
      {
        heading: '6. Seus Direitos (Art. 18, LGPD)',
        body: `<p>Como titular de dados, você tem direito a:</p>
          <ul>
            <li><strong>Acesso</strong> — saber quais dados temos sobre você.</li>
            <li><strong>Correção</strong> — corrigir dados incompletos ou desatualizados diretamente na plataforma.</li>
            <li><strong>Exportação (Portabilidade)</strong> — baixar seus dados pessoais em formato estruturado diretamente nas configurações da conta.</li>
            <li><strong>Eliminação</strong> — excluir sua conta e todos os dados associados. Disponível nas configurações da conta.</li>
            <li><strong>Revogação de consentimento</strong> — retirar consentimentos dados, como cookies analíticos, a qualquer momento.</li>
            <li><strong>Informação sobre compartilhamento</strong> — saber com quais entidades compartilhamos seus dados.</li>
          </ul>
          <p>Para exercer qualquer direito, entre em contato: <a href="mailto:${this.contactEmail}">${this.contactEmail}</a></p>`
      },
      {
        heading: '7. Crianças e Adolescentes',
        body: `<p>A plataforma não é direcionada a menores de 18 anos. O tratamento de dados de menores, quando necessário, segue a legislação aplicável e pode exigir autorização dos responsáveis legais.</p>`
      },
      {
        heading: '8. Alterações desta Política',
        body: `<p>Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas por e-mail ou notificação na plataforma. Recomendamos revisão periódica. A data da última atualização está indicada no topo desta página.</p>`
      },
      {
        heading: '9. Encarregado de Dados (DPO) e Contato',
        body: `<p>Nosso encarregado pelo tratamento de dados pode ser contatado pelo e-mail: <a href="mailto:${this.contactEmail}">${this.contactEmail}</a></p>
          <p>Legislação aplicável: Brasil — LGPD (Lei nº 13.709/2018). Foro: comarca de ${this.cityUF}.</p>`
      }
    ];
  },

  methods: {
    slug(text) {
      return text
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-|-$/g, '');
    },

    renderedContent(section) {
      const raw = section.content
        .map(part => {
          const id = `${section.id}-${this.slug(part.heading)}`;
          return `
            <div id="${id}" class="section-part">
              <h3 class="text-base font-semibold mt-4 mb-2">${part.heading}</h3>
              ${part.body}
            </div>
          `;
        })
        .join('');
      return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    },

    scrollTo(id) {
      this.$nextTick(() => {
        const el = document.getElementById(id);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        el.animate(
          [
            { backgroundColor: 'rgba(99,102,241,0.08)' },
            { backgroundColor: 'transparent' }
          ],
          { duration: 1200 }
        );
      });
    },

    toggleCompact() {
      this.compact = !this.compact;
      document.documentElement.classList.toggle('terms-compact', this.compact);
    },

    printPage() {
      window.print();
    }
  }
};
</script>

<style>
:root {
  --content-max-width: 70ch;
}

/* Compact mode: mantém só os títulos */
.terms-compact .prose .section-part p,
.terms-compact .prose .section-part ul,
.terms-compact .prose .section-part ol {
  display: none;
}

/* Impressão */
@media print {
  header,
  nav,
  button,
  input {
    display: none !important;
  }
  main {
    width: 100% !important;
  }
  body {
    background: #fff;
    color: #000;
  }
}

/* Prose sem limite */
.prose {
  max-width: none;
}
</style>
