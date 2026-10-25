import api from "./api";

export const complaintService = {
  async submitComplaint(complaintData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      formData.append("title", complaintData.title);
      formData.append("description", complaintData.description);
      formData.append("category", complaintData.category);
      formData.append("priority", complaintData.priority);
      formData.append("image", imageFile);

      const response = await api.post("/complaints/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post("/complaints/", complaintData);
    return response.data;
  },

  async getMyComplaints(params = {}) {
    const response = await api.get("/complaints/my", { params });
    return response.data;
  },

  async getAllComplaints(params = {}) {
    const response = await api.get("/complaints/", { params });
    return response.data;
  },

  async getAssignedComplaints(params = {}) {
    const response = await api.get("/complaints/assigned", { params });
    return response.data;
  },

  async getComplaintDetails(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  async assignDepartment(id, departmentId) {
    const response = await api.patch(`/complaints/${id}/assign`, {
      department_id: departmentId,
    });
    return response.data;
  },

  async updateStatus(id, newStatus, notes) {
    const response = await api.patch(`/complaints/${id}/status`, {
      new_status: newStatus,
      notes: notes || undefined,
    });
    return response.data;
  },

  async submitFeedback(id, rating, comments) {
    const response = await api.post(`/complaints/${id}/feedback`, {
      rating,
      comments: comments || undefined,
    });
    return response.data;
  },
};
