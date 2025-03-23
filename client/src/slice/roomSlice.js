import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/room';

export const roomHostingApi = postData =>
  axios.post(`${BASE_URL}/host`, postData);

export const addMemberApi = ({ room_id, member_id }) => {
  return axios.patch(`${BASE_URL}/add-member/${room_id}`, { member_id });
};

export const getRoomsApi = ({ language, country }) => {
  return axios.get(`${BASE_URL}/list`, {
    params: { language, country },
  });
};

export const joinRoomApi = roomId => axios.post(`${BASE_URL}/join/${roomId}`);
