<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        class="flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50"
        @click="$router.push('/vagas')"
      >
        <BaseIcon name="ChevronLeft" class="!size-4" />
      </button>
      <div>
        <h1 class="text-lg font-semibold text-slate-800">{{ isEditing ? 'Editar vaga' : 'Nova vaga' }}</h1>
        <p class="text-xs text-slate-400">{{ isEditing ? 'Atualize as informações da vaga' : 'Preencha os dados para publicar a vaga' }}</p>
      </div>
    </div>

    <div class="rounded-md border border-slate-200 bg-white p-6 space-y-6">

      <!-- ── Informações básicas ─────────────────────── -->
      <div class="space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Informações básicas</p>

        <div>
          <FormInput
            v-model="form.title"
            label="Título da vaga"
            placeholder="ex: Analista de Marketing Sênior"
          />
          <p class="mt-1 text-[11px] text-slate-400">* Campo obrigatório para publicar</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormSelect
            v-model="form.employmentType"
            label="Tipo de contrato"
            :options="employmentOptions"
          />
          <FormSelect
            v-model="form.seniority"
            label="Senioridade"
            :options="seniorityOptions"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <FormInput
            v-model="form.department"
            label="Área / Departamento"
            placeholder="ex: Marketing"
          />
          <FormInput
            v-model="form.vacanciesCount"
            label="Nº de vagas"
            type="number"
            placeholder="1"
          />
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- ── Local de trabalho ──────────────────────── -->
      <div class="space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Local de trabalho</p>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Modalidade</label>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="opt in modalityOptions"
              :key="opt.value"
              type="button"
              class="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition"
              :class="form.modality === opt.value
                ? 'border-slate-700 bg-slate-800 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
              @click="form.modality = opt.value"
            >
              <BaseIcon :name="opt.icon" class="!size-4" />
              {{ opt.label }}
            </button>

            <div v-if="form.modality === 'hybrid'" class="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span class="text-xs text-slate-500">Dias presenciais:</span>
              <select
                v-model="form.hybridDaysPerWeek"
                class="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option :value="null" disabled>—</option>
                <option v-for="n in 5" :key="n" :value="n">{{ n }}x por semana</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="form.modality !== 'remote'" class="grid grid-cols-2 gap-4">
          <FormInput v-model="form.locationCity" label="Cidade" placeholder="ex: São Paulo" />
          <FormInput v-model="form.locationState" label="Estado (sigla)" placeholder="ex: SP" />
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- ── Remuneração ────────────────────────────── -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Remuneração</p>
          <label class="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
            <span>A combinar</span>
            <button
              type="button"
              class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
              :class="form.salaryNegotiable ? 'bg-slate-700' : 'bg-slate-200'"
              @click="form.salaryNegotiable = !form.salaryNegotiable"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                :class="form.salaryNegotiable ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
          </label>
        </div>

        <div v-if="!form.salaryNegotiable" class="grid grid-cols-2 gap-4">
          <FormInput v-model="form.salaryMin" label="Mínimo (R$)" :currency="true" />
          <FormInput v-model="form.salaryMax" label="Máximo (R$)" :currency="true" />
        </div>
        <div v-else class="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
          Salário será exibido como "A combinar" para os candidatos
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- ── Descrição do cargo ─────────────────────── -->
      <div class="space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Descrição do cargo</p>

        <FormRichEditor
          v-model="form.description"
          label="Descrição da vaga"
          placeholder="Descreva as responsabilidades e o contexto da posição..."
        />
        <FormRichEditor
          v-model="form.requirements"
          label="Requisitos"
          placeholder="Liste os requisitos necessários e desejáveis..."
        />
        <FormRichEditor
          v-model="form.benefits"
          label="Benefícios"
          placeholder="Liste os benefícios oferecidos..."
        />
      </div>

      <hr class="border-slate-100" />

      <!-- ── Pipeline de seleção ──────────────────────── -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pipeline de seleção</p>
          <span class="text-[11px] text-slate-400">{{ form.stages.length }}/5 etapas</span>
        </div>

        <p class="text-xs text-slate-400">
          Defina as etapas do processo seletivo. As candidaturas percorrerão este funil no kanban.
        </p>

        <!-- Stage list -->
        <div class="space-y-2">
          <div
            v-for="(stage, i) in form.stages"
            :key="stage._key"
            class="group rounded-lg border border-slate-200 bg-white transition hover:border-slate-300"
          >
            <div class="flex items-center gap-3 px-3 py-3">
              <!-- Position -->
              <span class="w-4 flex-shrink-0 text-center text-xs font-bold text-slate-300">
                {{ i + 1 }}
              </span>

              <!-- Color swatch button -->
              <button
                type="button"
                class="flex-shrink-0 h-6 w-6 rounded-md shadow-sm transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
                :style="{ backgroundColor: stage.color, '--tw-ring-color': stage.color }"
                title="Alterar cor"
                @click="colorPickerOpen = colorPickerOpen === i ? null : i"
              />

              <!-- Name -->
              <FormInput
                v-model="stage.name"
                placeholder="Nome da etapa"
                wrapper-class="min-w-0 w-44 flex-shrink"
              />

              <!-- Divider -->
              <div class="h-8 w-px flex-shrink-0 bg-slate-100" />

              <!-- Botão de Ação -->
              <div class="flex flex-1 flex-col justify-center gap-1 min-w-0">
                <div class="flex flex-wrap items-center gap-1">
                  <span class="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Botão de Ação
                  </span>
                  <div class="flex gap-1">
                    <button
                      v-for="opt in STAGE_ACTION_OPTIONS"
                      :key="opt.value"
                      type="button"
                      class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium transition"
                      :class="stage.stageType === opt.value
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'"
                      :title="opt.label"
                      @click="stage.stageType = opt.value"
                    >
                      {{ opt.short }}
                    </button>
                  </div>
                </div>
                <p class="text-[10px] leading-none text-slate-300">
                  Ação exibida ao abrir um candidato nesta etapa
                </p>
              </div>

              <!-- Delete (visible on hover) -->
              <button
                v-if="form.stages.length > 2"
                type="button"
                class="flex-shrink-0 text-slate-200 opacity-0 transition group-hover:opacity-100 hover:!text-red-400"
                title="Remover etapa"
                @click="removeStage(i)"
              >
                <BaseIcon name="Trash" class="!size-4" />
              </button>
            </div>

            <!-- Inline color palette -->
            <div
              v-if="colorPickerOpen === i"
              class="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <button
                v-for="color in STAGE_PRESET_COLORS"
                :key="color"
                type="button"
                class="h-5 w-5 rounded-md transition hover:scale-110 focus:outline-none"
                :class="stage.color === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''"
                :style="{ backgroundColor: color }"
                @click="stage.color = color; colorPickerOpen = null"
              />
              <label class="cursor-pointer" title="Cor personalizada">
                <span class="flex h-5 w-5 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-slate-400 hover:border-slate-400 transition">
                  <BaseIcon name="Pencil" class="!size-3" />
                </span>
                <input type="color" v-model="stage.color" class="sr-only" @input="colorPickerOpen = null" />
              </label>
            </div>
          </div>

          <!-- Add button -->
          <button
            v-if="form.stages.length < 5"
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-3 text-xs font-medium text-slate-400 transition hover:border-slate-300 hover:bg-white hover:text-slate-600"
            @click="addStage"
          >
            <BaseIcon name="Plus" class="!size-3.5" />
            Adicionar etapa
          </button>
        </div>

        <!-- Pipeline preview -->
        <div class="flex items-center gap-1 flex-wrap">
          <template v-for="(stage, i) in form.stages" :key="stage._key">
            <div
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold"
              :style="{ backgroundColor: stage.color + '18', color: stage.color }"
            >
              <span class="h-1.5 w-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: stage.color }" />
              {{ stage.name || '—' }}
            </div>
            <BaseIcon
              v-if="i < form.stages.length - 1"
              name="ChevronRight"
              class="!size-3 flex-shrink-0 text-slate-300"
            />
          </template>
        </div>
      </div>

      <hr class="border-slate-100" />

      <!-- ── Configurações ──────────────────────────── -->
      <div class="space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Configurações</p>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <FormInput
              v-model="form.closesAt"
              label="Prazo de candidatura"
              type="date"
            />
            <p class="mt-1 text-[11px] text-slate-400">Deixe em branco para não definir prazo</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Ações -->
    <div class="flex items-center justify-between pb-6">
      <button
        class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        @click="$router.push('/vagas')"
      >
        Cancelar
      </button>
      <div class="flex gap-2">
        <button
          class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          :disabled="saving"
          @click="save('draft')"
        >
          <span v-if="saving && saveAction === 'draft'" class="flex items-center gap-1.5">
            <BaseIcon name="ArrowPath" class="!size-4 animate-spin" /> Salvando...
          </span>
          <span v-else>Salvar rascunho</span>
        </button>
        <BaseButton
          icon="Rocket"
          :loading="saving && saveAction === 'publish'"
          :disabled="saving"
          @click="save('publish')"
        >
          Publicar vaga
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import FormInput from '@/components/form/Input';
import FormSelect from '@/components/form/Select';
import FormRichEditor from '@/components/form/RichEditor';
import vagasService from '@/services/vagas';
import { useOnboardingStore } from '@/components/onboarding/store';

const STAGE_ACTION_OPTIONS = [
  { value: 'screening', label: 'Nenhuma',            short: 'Nenhuma'     },
  { value: 'interview', label: 'Agendar entrevista',  short: 'Entrevista'  },
  { value: 'offer',     label: 'Enviar proposta',     short: 'Proposta'    },
  { value: 'hired',     label: 'Contratado',          short: 'Contratado'  },
];

const STAGE_PRESET_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#14b8a6', '#06b6d4', '#64748b', '#1e293b'
];

const DEFAULT_STAGES = [
  { name: 'Triagem',    color: '#3b82f6', stageType: 'screening' },
  { name: 'Entrevista', color: '#8b5cf6', stageType: 'interview' },
  { name: 'Proposta',   color: '#f59e0b', stageType: 'offer'     },
  { name: 'Contratado', color: '#10b981', stageType: 'hired'     }
];

let _keyCounter = 0;
const makeStage = (data = {}) => ({
  _key:      ++_keyCounter,
  id:        data.id        || null,
  name:      data.name      || '',
  color:     data.color     || '#6366f1',
  stageType: data.stageType || data.stage_type || 'interview'
});

export default {
  components: { BaseButton, BaseIcon, FormInput, FormSelect, FormRichEditor },

  data() {
    return {
      loading: false,
      saving: false,
      saveAction: null,
      stagesToDelete: [],
      colorPickerOpen: null,
      STAGE_PRESET_COLORS,
      STAGE_ACTION_OPTIONS,
      form: {
        title: '',
        employmentType: '',
        seniority: '',
        department: '',
        vacanciesCount: 1,
        modality: 'remote',
        hybridDaysPerWeek: null,
        locationCity: '',
        locationState: '',
        salaryMin: null,
        salaryMax: null,
        salaryNegotiable: false,
        description: '',
        requirements: '',
        benefits: '',
        closesAt: '',
        stages: DEFAULT_STAGES.map(makeStage)
      },
      modalityOptions: [
        { value: 'remote',     label: 'Remoto',     icon: 'Pin'     },
        { value: 'hybrid',     label: 'Híbrido',    icon: 'Clock'   },
        { value: 'presential', label: 'Presencial', icon: 'Company' }
      ],
      employmentOptions: [
        { label: 'CLT / Integral',  value: 'full_time'  },
        { label: 'Pessoa Jurídica', value: 'pj'         },
        { label: 'Meio período',    value: 'part_time'  },
        { label: 'Estágio',         value: 'internship' },
        { label: 'Freelance',       value: 'freelance'  },
        { label: 'Temporário',      value: 'temporary'  }
      ],
      seniorityOptions: [
        { label: 'Estágio',     value: 'intern'     },
        { label: 'Júnior',      value: 'junior'     },
        { label: 'Pleno',       value: 'mid'        },
        { label: 'Sênior',      value: 'senior'     },
        { label: 'Especialista',value: 'specialist' },
        { label: 'Gerente',     value: 'manager'    },
        { label: 'Diretor',     value: 'director'   }
      ],
      hybridDaysOptions: [1, 2, 3, 4, 5].map(n => ({ label: `${n} dia${n > 1 ? 's' : ''}`, value: n }))
    };
  },

  computed: {
    isEditing() {
      return !!this.$route.params.id;
    }
  },

  async mounted() {
    if (this.isEditing) {
      this.loading = true;
      try {
        const [job, stages] = await Promise.all([
          vagasService.fetchJob(this.$route.params.id),
          vagasService.fetchPipelineStages(this.$route.params.id)
        ]);
        this.form = {
          title:             job.title || '',
          employmentType:    job.employmentType || '',
          seniority:         job.seniority || '',
          department:        job.department || '',
          vacanciesCount:    job.vacanciesCount || 1,
          modality:          job.modality || 'remote',
          hybridDaysPerWeek: job.hybridDaysPerWeek || null,
          locationCity:      job.locationCity || '',
          locationState:     job.locationState || '',
          salaryMin:         job.salaryMin || null,
          salaryMax:         job.salaryMax || null,
          salaryNegotiable:  !job.salaryVisible,
          description:       job.description || '',
          requirements:      job.requirements || '',
          benefits:          job.benefits || '',
          closesAt:          job.closesAt ? job.closesAt.slice(0, 10) : '',
          stages:            stages.length
            ? stages.map(makeStage)
            : DEFAULT_STAGES.map(makeStage)
        };
      } finally {
        this.loading = false;
      }
    }
  },

  methods: {
    addStage() {
      if (this.form.stages.length >= 5) return;
      this.form.stages.push(makeStage());
    },

    removeStage(index) {
      const stage = this.form.stages[index];
      if (stage.id) this.stagesToDelete.push(stage.id);
      this.form.stages.splice(index, 1);
    },

    async syncStages(jobId) {
      const stages = this.form.stages;

      // Delete removed stages
      await Promise.all(
        this.stagesToDelete.map(id => vagasService.deletePipelineStage(jobId, id).catch(() => {}))
      );

      // Create or update each stage
      await Promise.all(
        stages.map((stage, i) => {
          const data = { name: stage.name, color: stage.color, stage_type: stage.stageType, position: i };
          return stage.id
            ? vagasService.updatePipelineStage(jobId, stage.id, data)
            : vagasService.createPipelineStage(jobId, data);
        })
      );
    },

    async save(action) {
      this.saving = true;
      this.saveAction = action;
      try {
        const { stages: _stages, ...jobFields } = this.form;
        const payload = {
          ...jobFields,
          salaryVisible: !this.form.salaryNegotiable,
          status: action === 'draft' ? 'draft' : 'published'
        };

        if (this.isEditing) {
          const jobId = this.$route.params.id;
          await vagasService.updateJob(jobId, payload);
          await this.syncStages(jobId);
          if (action === 'publish') await vagasService.publishJob(jobId);
        } else {
          const job = await vagasService.createJob(payload);
          await this.syncStages(job.id);
          if (action === 'publish' && job?.id) await vagasService.publishJob(job.id);
          useOnboardingStore().setVagaCreated();
        }

        this.$router.push('/vagas');
      } catch (error) {
        console.error(error);
      } finally {
        this.saving = false;
        this.saveAction = null;
      }
    }
  }
};
</script>
