import { userSignUpApi,userLoginApi } from '../slice/userSlice';

export const userSignUpHook = async data => {
  const response = await userSignUpApi(data);
  console.log('response before', response.data);
  return response.data;
};

export const userLoginHook = async data => {
  const response = await userLoginApi(data);
  return response.data;
};
