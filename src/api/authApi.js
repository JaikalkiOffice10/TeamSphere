import client from "./client";

const authApi = {
  // The backend expects a form with `username` (the email) and `password`
  login: (email, password) =>
    client.post("/auth/login", new URLSearchParams({ username: email, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  // First platform admin (public, works only while no admin exists)
  register: (data) => client.post("/admin/create", data),
  //c Another admin, created by a logged-in admin
  createAdmin: (data) => client.post("/admin/create-by-admin", data),
  me: () => client.get("/auth/me"),
};

export default authApi;
