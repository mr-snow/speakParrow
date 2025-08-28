import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { userLoginHook, userSignUpHook } from '../../hooks/userHook';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { authStore } from '../../store/authStore';

function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.pathname.includes('signup') ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const { login } = authStore();

  const onFinish = data => {
    console.log('Success:', data);
    if (mode == 'signup') {
      userSignUp(data);
    } else {
      userLogin(data);
    }
  };
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const { control, handleSubmit, reset } = useForm();

  const { mutate: userSignUp } = useMutation({
    queryKey: ['user/register'],
    mutationFn: userSignUpHook,
    onSuccess: data => {
      login({ user_id: data._id, username: data.username, token: data.token });
      // localStorage.setItem('id', data._id);
      // localStorage.setItem('username', data.username);
      // localStorage.setItem('token', data.token);
      message.success('Successfull');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: error => {
      console.log('error', error.response.data.message || error);
      message.error(error.response.data.message);
    },
  });

  const { mutate: userLogin } = useMutation({
    queryKey: ['user/login'],
    mutationFn: userLoginHook,
    onSuccess: data => {
      login({ user_id: data._id, username: data.username, token: data.token });
      // localStorage.setItem('id', data._id);
      // localStorage.setItem('username', data.username);
      // localStorage.setItem('token', data.token);

      message.success('Successfull');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: error => {
      console.log(error.message);
      message.error(error.response.data.message);
    },
  });

  return (
    <div className=" bg-[url(images/speakParro-theme1.jpg)]  h-screen flex flex-col justify-center items-center  ">
      <div className="bg-linear-to-b from-[#d74c02] to-[#ff7505] w-[60%]  sm:w-[50%]  h-flex-auto md:w-[40%]  lg:w-[35%] xl:w-[30%]  flex flex-col  justify-center items-center shadow-[4px_4px_8Px_2Px] border-none   rounded-2xl  ">
        <div className="text-white font-bold h-1/5 w-full rounded-t-2xl flex flex-col justify-center items-center text-xl bg-blue-400">
          <h1 className="text-2xl"> SpeakParro</h1>

          <h5 className="text-xl text-yellow-400 ">
            {mode === 'signup' ? 'SignUp' : 'Login'}
          </h5>
        </div>

        <div className=" h-4/5 w-full rounded-b-2xl bg-white flex flex-col items-center ">
          <div className="bg-blue-200 p-2 h-[100%] flex flex-col gap-2 justify-start pt-8  items-center w-full rounded-b-2xl">
            <Form
              className=" custom-form  w-[90%]   "
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              initialValues={{ remember: true }}
              onFinish={handleSubmit(onFinish)}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              {mode !== 'login' && (
                <Controller
                  name="username"
                  control={control}
                  disabled={mode == 'login'}
                  rules={{
                    required: ' input your username!',
                  }}
                  render={({ field, fieldState }) => (
                    <Form.Item
                      label="Username"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Input {...field} placeholder=" Enter Username " />

                      {fieldState.error && (
                        <p className="error text-red-700  w-fit pl-12">
                          {fieldState.error.message}
                        </p>
                      )}
                    </Form.Item>
                  )}
                />
              )}

              <Controller
                name="email"
                control={control}
                rules={{ required: ' input your email!' }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label="Email"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input
                      {...field}
                      className="w-full"
                      placeholder={
                        mode == 'login'
                          ? ' Enter Email / Username '
                          : ' Enter Email'
                      }
                    />

                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Form.Item>
                )}
              />

              <Controller
                name="password"
                rules={{
                  required: ' input your password!',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long',
                  },
                  pattern: {
                    value:
                      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      'Password must include uppercase, lowercase, number, and special character',
                  },
                }}
                control={control}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label="Password"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input.Password
                      className="w-full"
                      {...field}
                      placeholder=" Enter Password "
                    />
                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Form.Item>
                )}
              />
              <br />
              {/* Toggle mode */}
              <p className="text-center text-sm mt-4">
                {mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <span
                      className="text-blue-600 cursor-pointer"
                      onClick={() => {
                        setMode('login');
                        reset();
                      }}
                    >
                      Login
                    </span>
                  </>
                ) : (
                  <>
                    Don’t have an account?{' '}
                    <span
                      className="text-blue-600 cursor-pointer"
                      onClick={() => {
                        setMode('signup');
                        reset();
                      }}
                    >
                      Sign Up
                    </span>
                  </>
                )}
              </p>

              <Form.Item label={null}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="custom-submit-btn w-[100px] md:w-[150px]"
                >
                  {mode === 'signup' ? 'Sign Up' : 'Login'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
