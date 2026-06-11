import axios from '@/axios';

export default {
  fetchJobs: () => axios.get('/hiring/jobs'),
  fetchJob: id => axios.get(`/hiring/jobs/${id}`),
  createJob: data => axios.post('/hiring/jobs', data),
  updateJob: (id, data) => axios.put(`/hiring/jobs/${id}`, data),
  publishJob: id => axios.put(`/hiring/jobs/${id}/publish`),

  fetchApplications: jobId => axios.get(`/hiring/jobs/${jobId}/applications`),
  updateApplication: (jobId, id, data) => axios.put(`/hiring/jobs/${jobId}/applications/${id}`, data),
  moveApplicationStage: (jobId, id, stageId) =>
    axios.put(`/hiring/jobs/${jobId}/applications/${id}/move_stage`, { stageId }),
  reorderApplications: (jobId, ids) =>
    axios.put(`/hiring/jobs/${jobId}/applications/reorder`, { ids }),
  summarizeApplication: (jobId, id) =>
    axios.post(`/hiring/jobs/${jobId}/applications/${id}/summarize`),
  matchScoreApplication: (jobId, id) =>
    axios.post(`/hiring/jobs/${jobId}/applications/${id}/match_score`),

  fetchPipelineStages:  jobId          => axios.get(`/hiring/jobs/${jobId}/pipeline_stages`),
  createPipelineStage: (jobId, data)  => axios.post(`/hiring/jobs/${jobId}/pipeline_stages`, { pipeline_stage: data }),
  updatePipelineStage: (jobId, id, data) => axios.put(`/hiring/jobs/${jobId}/pipeline_stages/${id}`, { pipeline_stage: data }),
  deletePipelineStage: (jobId, id)    => axios.delete(`/hiring/jobs/${jobId}/pipeline_stages/${id}`),

  fetchInterviews: (params = {}) => axios.get('/hiring/interviews', { params }),
  createInterview: data => axios.post('/hiring/interviews', data),
  updateInterview: (id, data) => axios.put(`/hiring/interviews/${id}`, { interview: data }),

  fetchOffers: (params = {}) => axios.get('/hiring/offers', { params }),
  createOffer: data => axios.post('/hiring/offers', data),
  sendOffer: id => axios.post(`/hiring/offers/${id}/send_offer`),
  resendOffer: id => axios.post(`/hiring/offers/${id}/resend_offer`)
};
