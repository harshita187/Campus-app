import apiClient from "./api";

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post("/uploads/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
