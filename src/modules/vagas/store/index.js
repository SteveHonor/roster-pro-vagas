import { defineStore } from 'pinia';

export const useVagasStore = defineStore('vagas', {
  state: () => ({
    jobs: [],
    job: null,
    stages: [],
    applications: [],
    application: null
  }),

  actions: {
    setJobs(jobs) {
      this.jobs = jobs;
    },
    setJob(job) {
      this.job = job;
    },
    setStages(stages) {
      this.stages = stages;
    },
    setApplications(applications) {
      this.applications = applications;
    },
    setApplication(application) {
      this.application = application;
    },
    resetApplication() {
      this.application = null;
    },
    moveApplication(applicationId, stageId) {
      const app = this.applications.find(a => a.id === applicationId);
      if (app) app.stageId = stageId;
    },
    updateApplicationRating(applicationId, rating) {
      const app = this.applications.find(a => a.id === applicationId);
      if (app) app.rating = rating;
    }
  }
});
