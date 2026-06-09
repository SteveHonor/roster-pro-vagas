<template>
  <section v-if="eventStore.getDaysChosen.length">
    <div class="w-full">
      <span class="text-sm font-light text-gray-800"> Defina os horários </span>

      <div class="mt-2 flex flex-wrap gap-y-8">
        <div
          v-for="chose in eventStore.getDaysChosen"
          :key="chose.day"
          class="flex w-full flex-wrap rounded border-l-2 border-gray-600 bg-gray-100 p-3 shadow"
        >
          <!-- HEADER -->
          <div class="flex w-full items-center gap-2">
            <BaseIcon name="calendar" class="w-8 text-gray-700" />

            <div class="w-3/6 font-bold">
              <div class="text-base text-gray-700">
                {{ formatTitle(chose.day) }}
              </div>

              <div
                v-if="chose.weekDays?.length"
                class="mt-1 flex flex-wrap gap-2 text-xs"
              >
                Dias:
                <span v-for="(day, i) in chose.weekDays" :key="i">
                  {{ day }}
                </span>
              </div>
            </div>

            <div class="flex w-3/6 justify-end gap-2">
              <button
                class="flex items-center gap-1 rounded-full btn-brand px-3"
                aria-label="Adicionar período"
                @click="setHour(chose.day)"
              >
                <BaseIcon name="plus-circle" class="h-5 w-5" />
                <span class="text-sm font-bold">período</span>
              </button>

              <button
                class="rounded-full bg-white p-1"
                aria-label="Remover dia"
                @click="removeDay(chose.day)"
              >
                <BaseIcon name="trash" class="h-4 w-4 text-red-400" />
              </button>
            </div>
          </div>

          <!-- PERIODOS -->
          <div class="mt-3 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
            <div
              v-for="(period, indexHour) in chose.periods"
              :key="indexHour"
              class="flex flex-col rounded-lg bg-white p-4 shadow"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-gray-600">
                  {{
                    chose.periods.length > 1
                      ? `${indexHour + 1} º Período:`
                      : 'Período:'
                  }}
                </span>

                <BaseIcon
                  name="trash"
                  class="h-4 w-4 cursor-pointer"
                  :class="
                    indexHour === 0 && chose.periods.length === 1
                      ? 'pointer-events-none text-gray-300'
                      : 'text-black'
                  "
                  @click="removeHour(chose.day, indexHour)"
                />
              </div>

              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- INICIO -->
                <div class="flex flex-col gap-1">
                  <span
                    class="text-sm font-light text-gray-800"
                    :class="{
                      ' text-red-600':
                        eventStore.getErrors[chose.day]?.[indexHour]?.start
                    }"
                    >Início</span
                  >

                  <Input
                    v-model="period.start"
                    type="time"
                    class="w-full min-w-24"
                    :class="{
                      'rounded border border-red-600':
                        eventStore.getErrors[chose.day]?.[indexHour]?.start
                    }"
                    @click="openTimePicker"
                    @blur="checkStartTime(period.start, chose.day, indexHour)"
                  />

                  <span
                    v-if="eventStore.getErrors[chose.day]?.[indexHour]?.start"
                    class="text-xs text-red-600"
                  >
                    {{ eventStore.getErrors[chose.day][indexHour].start }}
                  </span>
                </div>

                <!-- TERMINO -->
                <div class="flex flex-col gap-1">
                  <span
                    class="text-sm font-light text-gray-800"
                    :class="{
                      ' text-red-600':
                        eventStore.getErrors[chose.day]?.[indexHour]?.end
                    }"
                    >Término</span
                  >

                  <Input
                    v-model="period.end"
                    type="time"
                    class="w-full min-w-24"
                    :class="{
                      'rounded border border-red-600':
                        eventStore.getErrors[chose.day]?.[indexHour]?.end
                    }"
                    @click="openTimePicker"
                    @blur="
                      checkEndTime(
                        period.start,
                        period.end,
                        chose.day,
                        indexHour
                      )
                    "
                  />

                  <span
                    v-if="eventStore.getErrors[chose.day]?.[indexHour]?.end"
                    class="text-xs text-red-600"
                  >
                    {{ eventStore.getErrors[chose.day][indexHour].end }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useEventStore } from '@/modules/calendar/store/event';
import BaseIcon from '@/components/icons/BaseIcon';
import Input from '@/components/form/Input.vue';

export default {
  components: {
    BaseIcon,
    Input
  },
  props: {
    type: {
      type: String,
      default: () => 'day',
      required: true
    }
  },
  computed: {
    eventStore: () => useEventStore()
  },
  methods: {
    openTimePicker(event) {
      const input = event.target;

      if (input.showPicker) {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    },
    checkStartTime(input, day, indexHour) {
      if (!input) return;
      if (this.type !== 'day') return;

      const [hour, minute] = input.split(':').map(Number);

      const selected = this.moment({
        year: this.eventStore.event.year,
        month: this.eventStore.event.month - 1,
        day,
        hour,
        minute
      });

      if (selected.isBefore(this.moment())) {
        this.eventStore.setError({
          day,
          indexHour,
          input: 'start',
          error: 'Hora inicial inválida'
        });
      } else {
        this.eventStore.setError({
          day,
          indexHour,
          input: 'start',
          error: null
        });
      }
    },
    checkEndTime(start, end, day, indexHour) {
      // segurança
      if (!start || !end) return;

      // compara HH:mm corretamente
      if (end <= start) {
        this.eventStore.setError({
          day,
          indexHour,
          input: 'end',
          error: 'Término menor que início'
        });
      } else {
        // remove erro do end
        this.eventStore.setError({
          day,
          indexHour,
          input: 'end',
          error: null
        });
      }
    },
    removeHour(day, periodIndex) {
      this.eventStore.removeHourPeriod(day, periodIndex);
    },
    removeDay(day) {
      this.eventStore.removeDay(day);
    },
    setHour(day) {
      this.eventStore.setHour(day);
    },
    changeHour(day, newHour, type) {
      this.eventStore.changeHour({ day, type, hour: newHour });
    },
    weekDays(day) {
      return {
        1: 'Segunda-Feira',
        2: 'Terça-Feira',
        3: 'Quarta-Feira',
        4: 'Quinta-Feira',
        5: 'Sexta-Feira',
        6: 'Sábado',
        7: 'Domingo'
      }[day];
    },
    formatTitle(day) {
      return {
        day: `Dia: ${day}`,
        week: this.weekDays(day),
        custom: `Data: ${this.moment(day).format('DD/MM/YY')}`
      }[this.type];
    }
  }
};
</script>
