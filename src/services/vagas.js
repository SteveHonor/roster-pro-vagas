import axios from '@/axios';

export default {
  fetchJobs: () => axios.get('/vagas/jobs'),
  fetchJob: id => axios.get(`/vagas/jobs/${id}`),
  createJob: data => axios.post('/vagas/jobs', data),
  updateJob: (id, data) => axios.put(`/vagas/jobs/${id}`, data),
  publishJob: id => axios.put(`/vagas/jobs/${id}/publish`),

  fetchApplications: jobId => axios.get(`/vagas/jobs/${jobId}/applications`),
  updateApplication: (jobId, id, data) => axios.put(`/vagas/jobs/${jobId}/applications/${id}`, data),
  moveApplicationStage: (jobId, id, stageId) =>
    axios.put(`/vagas/jobs/${jobId}/applications/${id}/move_stage`, { stageId }),

  fetchPipelineStages: jobId => axios.get(`/vagas/jobs/${jobId}/pipeline_stages`),

  createInterview: data => axios.post('/vagas/interviews', data),

  createOffer: data => axios.post('/vagas/offers', data),
  sendOffer: id => axios.post(`/vagas/offers/${id}/send_offer`)
};
