import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL;


export const roomHostingApi = postData => {
  return axiosInstance.post('room/host', postData);
};

export const addMemberApi = ({ room_id, member_id }) => {
  return axiosInstance.patch(`room/add-member/${room_id}`, {
    member_id,
  });
};

export const getRoomById = async ({ room_id, member_id }) => {
  return await axiosInstance.get(`room/${room_id}`, {
    params: { member_id },
  });
};

export const getRoomsApi = ({ language, country }) => {
  return axios.get(`${BASE_URL}room/list`, {
    params: { language, country },
  });
};

export const joinRoomApi = roomId =>
  axios.post(`${BASE_URL}/room/join/${roomId}`);

export const exitRoomApi = async ({ room_id, member_id }) => {
  try {
    return axiosInstance.delete(`room/${room_id}/member/${member_id}`);
  } catch (error) {
    throw error;
  }
};

export const removeMemberApi = async ({ room_id, member_id, owner_id }) => {
  try {
    return axiosInstance.delete(`room/${room_id}/owner/${owner_id}`, {
      data: {
        member_id,
      },
    });
  } catch (error) {
    throw error;
  }
};
