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
          <div class="flex gap-2">
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
          </div>
        </div>

        <div v-if="form.modality === 'hybrid'" class="grid grid-cols-2 gap-4">
          <FormSelect
            v-model="form.hybridDaysPerWeek"
            label="Dias presenciais por semana"
            :options="hybridDaysOptions"
          />
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

        <FormTextarea
          v-model="form.description"
          label="Descrição da vaga"
          placeholder="Descreva as responsabilidades e o contexto da posição..."
          :rows="5"
        />
        <FormTextarea
          v-model="form.requirements"
          label="Requisitos"
          placeholder="Liste os requisitos necessários e desejáveis..."
          :rows="4"
        />
        <FormTextarea
          v-model="form.benefits"
          label="Benefícios"
          placeholder="Liste os benefícios oferecidos..."
          :rows="4"
        />
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
import FormTextarea from '@/components/form/Textarea';
import vagasService from '@/services/vagas';
import { useOnboardingStore } from '@/components/onboarding/store';

export default {
  components: { BaseButton, BaseIcon, FormInput, FormSelect, FormTextarea },

  data() {
    return {
      loading: false,
      saving: false,
      saveAction: null,
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
        closesAt: ''
      },
      modalityOptions: [
        { value: 'remote',     label: 'Remoto',     icon: 'Pin'     },
        { value: 'hybrid',     label: 'Híbrido',    icon: 'Clock'   },
        { value: 'presential', label: 'Presencial', icon: 'Company' }
      ],
      employmentOptions: [
        { label: 'CLT / Integral', value: 'full_time'  },
        { label: 'Meio período',   value: 'part_time'  },
        { label: 'Estágio',        value: 'internship' },
        { label: 'Freelance',      value: 'freelance'  },
        { label: 'Temporário',     value: 'temporary'  }
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
        const job = await vagasService.fetchJob(this.$route.params.id);
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
          closesAt:          job.closesAt ? job.closesAt.slice(0, 10) : ''
        };
      } finally {
        this.loading = false;
      }
    }
  },

  methods: {
    async save(action) {
      this.saving = true;
      this.saveAction = action;
      try {
        const payload = {
          ...this.form,
          salaryVisible: !this.form.salaryNegotiable,
          status: action === 'draft' ? 'draft' : 'published'
        };

        if (this.isEditing) {
          await vagasService.updateJob(this.$route.params.id, payload);
          if (action === 'publish') {
            await vagasService.publishJob(this.$route.params.id);
          }
        } else {
          const job = await vagasService.createJob(payload);
          if (action === 'publish' && job?.id) {
            await vagasService.publishJob(job.id);
          }
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
