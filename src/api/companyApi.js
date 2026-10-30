import client from "./client";

const companyApi = {
  list: (params) => client.get("/companies", { params }),
  get: (id) => client.get(`/companies/${id}`),
  create: (data) => client.post("/companies", data),
  update: (id, data) => client.patch(`/companies/${id}`, data),
  remove: (id) => client.delete(`/companies/${id}`),
  employees: (id, params) => client.get(`/companies/${id}/employees`, { params }),
  stats: (id) => client.get(`/companies/${id}/stats`),
};

export default companyApi;
