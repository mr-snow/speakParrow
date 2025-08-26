import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const roomHostingApi = postData =>
  axios.post(`${BASE_URL}room/host`, postData);

export const addMemberApi = ({ room_id, member_id }) => {
  return axios.patch(`${BASE_URL}room/add-member/${room_id}`, { member_id });
};

export const getRoomsApi = ({ language, country }) => {
  return axios.get(`${BASE_URL}room/list`, {
    params: { language, country },
  });
};

export const joinRoomApi = roomId =>
  axios.post(`${BASE_URL}/room/join/${roomId}`);
