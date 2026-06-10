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
  reorderApplications: (jobId, ids) =>
    axios.put(`/vagas/jobs/${jobId}/applications/reorder`, { ids }),
  summarizeApplication: (jobId, id) =>
    axios.post(`/vagas/jobs/${jobId}/applications/${id}/summarize`),
  matchScoreApplication: (jobId, id) =>
    axios.post(`/vagas/jobs/${jobId}/applications/${id}/match_score`),

  fetchPipelineStages:  jobId          => axios.get(`/vagas/jobs/${jobId}/pipeline_stages`),
  createPipelineStage: (jobId, data)  => axios.post(`/vagas/jobs/${jobId}/pipeline_stages`, { pipeline_stage: data }),
  updatePipelineStage: (jobId, id, data) => axios.put(`/vagas/jobs/${jobId}/pipeline_stages/${id}`, { pipeline_stage: data }),
  deletePipelineStage: (jobId, id)    => axios.delete(`/vagas/jobs/${jobId}/pipeline_stages/${id}`),

  fetchInterviews: (params = {}) => axios.get('/vagas/interviews', { params }),
  createInterview: data => axios.post('/vagas/interviews', data),
  updateInterview: (id, data) => axios.put(`/vagas/interviews/${id}`, { interview: data }),

  fetchOffers: (params = {}) => axios.get('/vagas/offers', { params }),
  createOffer: data => axios.post('/vagas/offers', data),
  sendOffer: id => axios.post(`/vagas/offers/${id}/send_offer`),
  resendOffer: id => axios.post(`/vagas/offers/${id}/resend_offer`)
};
