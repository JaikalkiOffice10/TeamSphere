import client from "./client";

const employeeApi = {
  list: (params) => client.get("/employees", { params }),
  me: () => client.get("/employees/me"),
  get: (id) => client.get(`/employees/${id}`),
  create: (data) => client.post("/employees", data),
  update: (id, data) => client.patch(`/employees/${id}`, data),
  remove: (id) => client.delete(`/employees/${id}`),
};

export default employeeApi;
