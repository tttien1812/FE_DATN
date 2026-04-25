import axios from "./axios";

// LOGIN
export const loginApi = (data) => {
  return axios.post("/api/login", data);
};

// GET ALL USERS
export const getAllUsersApi = () => {
  return axios.get("/api/get-all-users");
};

// CREATE USER
export const createUserApi = (data) => {
  return axios.post("/api/create-users", data);
};

// UPDATE USER
export const updateUserApi = (formData) => {
  return axios.put("/api/edit-users", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// DELETE USER
export const deleteUserApi = (id) => {
  return axios.delete("/api/delete-users", {
    data: { id },
  });
};

// GET USER BY ID
export const getUserByIdApi = (id) => {
  return axios.get(`/api/users/${id}`);
};
