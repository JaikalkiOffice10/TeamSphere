import client from "./client";

const projectApi = {
  list: (params) => client.get("/projects", { params }),
  get: (id) => client.get(`/projects/${id}`),
  create: (data) => client.post("/projects", data),
  update: (id, data) => client.patch(`/projects/${id}`, data),
  remove: (id) => client.delete(`/projects/${id}`),

  // Employee assignment (admin / manager). Employees use mine() to see their own projects.
  employees: (id) => client.get(`/projects/${id}/employees`),
  assign: (id, employeeId) => client.post(`/projects/${id}/employees/${employeeId}`),
  unassign: (id, employeeId) => client.delete(`/projects/${id}/employees/${employeeId}`),
  mine: (params) => client.get("/projects/my/projects", { params }),
};

export default projectApi;
