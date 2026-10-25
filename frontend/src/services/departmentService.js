import api from "./api";

export const departmentService = {
  async getDepartments(isActive = true) {
    const response = await api.get("/departments/", {
      params: { is_active: isActive },
    });
    return response.data;
  },

  async createDepartment(departmentData) {
    const response = await api.post("/departments/", departmentData);
    return response.data;
  },
};
