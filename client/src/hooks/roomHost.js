import { roomHostingApi, getRoomsApi, joinRoomApi } from '../slice/roomSlice';

export const roomHosting = async postData => {
  const response = await roomHostingApi(postData);
  return response.data;
};

export const getRooms = async (language, country) => {
  const response = await getRoomsApi(language, country);
  return response.data;
};

export const joinRoom = async roomId => {
  const response = await joinRoomApi(roomId);
  return response.data;
};
