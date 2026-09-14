import apiClient from "../../api/client";

export const getUsers = async (accessToken) => {
  const response = await apiClient.get("/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const deactivateUser = async (
  userId,
  accessToken
) => {
  const response = await apiClient.patch(
    `/users/${userId}/deactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const inviteUser = async (
  userData,
  accessToken
) => {
  const response = await apiClient.post(
    "/users/invite",
    userData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};