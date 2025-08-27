import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const userSignUpApi = postData =>
  axios.post(`${BASE_URL}/user/signup`, postData);

export const userLoginApi = postData =>
  axios.post(`${BASE_URL}/user/login`, postData);

export const userLogoutApi = postData =>
  axios.post(`${BASE_URL}/user/logout`, postData);

