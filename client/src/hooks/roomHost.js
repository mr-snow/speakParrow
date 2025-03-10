import axios from 'axios';

export const roomHosting = async postData => {
  const response = await axios.post(
    'http://localhost:3000/api/room/host',
    postData
  );
  return response.data;
};
