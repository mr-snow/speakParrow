import { useForm } from 'react-hook-form';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/FormFields/Input/Input';
import { sendLoginCredentials } from '../../hooks/loginHook';
import { useState } from 'react';

export default function Login() {
  const { control, handleSubmit } = useForm();
  const [messageApi, buttonContext] = message.useMessage();
  const navigate = useNavigate();

  const { mutate: submitLogin } = sendLoginCredentials({
    onSuccess: data => {
      messageApi.open({
        type: 'success',
        content: 'Logged in successfully!',
      });

      localStorage.setItem('user', JSON.stringify(data));

      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    onError: error => {
      messageApi.open({
        type: 'error',
        content: error?.response?.data?.error || 'Login failed!',
      });
    },
  });

  const onSubmit = data => {
    localStorage.setItem('username', data.username);
    submitLogin(data);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-slate-300 p-4 xs:w-2/3 lg:w-1/3"
      >
        <div className="w-full text-center text-xl font-semibold text-black">
          <h3>Identifier</h3>
        </div>

        <div className="w-full">
          <Input
            name="username"
            label="Username"
            control={control}
            placeholder="Please enter Username"
            rules={{ required: 'This Field is Required' }}
          />
        </div>

        <div className="w-full">
          <Input
            name="password"
            label="Password"
            placeholder="******"
            type="password"
            control={control}
            rules={{ required: 'This Field is Required' }}
          />
        </div>

        <div>
          {buttonContext}
          <Button type="primary" htmlType="submit">
            Log in
          </Button>
        </div>
      </form>
    </div>
  );
}
