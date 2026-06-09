import { defineStore } from 'pinia';

export const useBlockStore = defineStore('block', {
  state: () => ({
    block: {},
    blocks: [],
    selectedDates: [],
    observation: '',
    positionName: ''
  }),
  actions: {
    setBlocks(blocks) {
      this.blocks = blocks;
    },
    setBlock(block) {
      this.block = block;
    },
    resetBlock() {
      this.block = {};
      this.selectedDates = [];
      this.observation = '';
    },
    toggleDate(dateStr) {
      const id = this.selectedDates.indexOf(dateStr);
      if (id >= 0) {
        this.selectedDates.splice(id, 1);
      } else {
        this.selectedDates.push(dateStr);
      }
      this.selectedDates.sort();
    },
    reset() {
      this.selectedDates = [];
    }
  }
});
