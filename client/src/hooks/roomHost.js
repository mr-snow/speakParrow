import {
  roomHostingApi,
  getRoomsApi,
  joinRoomApi,
  addMemberApi,
  getRoomById,
  exitRoomApi,
} from '../slice/roomSlice';

export const roomHosting = async postData => {
  console.log(postData, 'postData');
  const response = await roomHostingApi(postData);
  return response.data;
};

export const getRooms = async ({ language, country }) => {
  const response = await getRoomsApi({ language, country });
  return response.data;
};

export const joinRoom = async roomId => {
  const response = await joinRoomApi(roomId);
  return response.data;
};

export const getRoomByIdHook = async ({ room_id, member_id }) => {
  const response = await getRoomById({ room_id, member_id });
  return response.data;
};

export const addMember = async postData => {
  try {
    const response = await addMemberApi(postData);

    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Unexpected server response');
    }
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const exitRoomHook = async deletData => {
  const response = await exitRoomApi(deletData);
  return response.data;
};
