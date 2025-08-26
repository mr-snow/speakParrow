import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { userSignUpHook } from '../../hooks/userHook';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// bg-[url(images/speakParrow-signup.jpg)]

function SignupPage() {
  const navigate = useNavigate();

  const onFinish = data => {
    console.log('Success:', data);
    userSignUp(data);
  };
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const { control, handleSubmit, reset } = useForm();

  const { mutate: userSignUp } = useMutation({
    queryKey: ['userSignUp'],
    mutationFn: userSignUpHook,
    onSuccess: data => {
      localStorage.setItem('token', data.token);
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

  return (
    <div className=" bg-[url(images/speakParro-theme1.jpg)]  h-screen flex flex-col justify-center items-center  ">
      <div className="bg-linear-to-b from-[#d74c02] to-[#ff7505] w-[60%]  sm:w-[50%]  h-[70%] md:w-[40%]  lg:w-[35%] xl:w-[30%]  flex flex-col  justify-center items-center shadow-[4px_4px_8Px_2Px] border-none   rounded-2xl  ">
        <div className="text-white font-bold h-1/5 w-full rounded-t-2xl flex flex-col justify-center items-center text-xl bg-blue-400">
          <h1 className="text-2xl"> SpeakParro</h1>

          <h5 className="text-sm text-red-400">Sign Up</h5>
        </div>
        <div className=" h-4/5 w-full rounded-b-2xl bg-white flex flex-col items-center ">
          <div className="bg-blue-100 h-[100%] flex flex-col gap-2 justify-start pt-8  items-center w-full rounded-b-2xl">
            <Form
              className=" custom-form  w-[90%] "
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 24 }}
              initialValues={{ remember: true }}
              onFinish={handleSubmit(onFinish)}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Controller
                name="username"
                control={control}
                rules={[
                  { required: true, message: 'Please input your username!' },
                ]}
                render={({ field, fieldState }) => (
                  <Form.Item label="Username" className="w-full">
                    <Input {...field} />

                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Form.Item>
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={[
                  { required: true, message: 'Please input your email!' },
                ]}
                render={({ field, fieldState }) => (
                  <Form.Item label="email" className="w-full">
                    <Input {...field} />

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
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
                control={control}
                render={({ field, fieldState }) => (
                  <Form.Item label="Password" className="w-full">
                    <Input.Password className="w-full" {...field} />
                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Form.Item>
                )}
              />

              <Form.Item
                className="w-full"
                valuePropName="checked"
                label={null}
              >
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item label={null}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="custom-submit-btn w-[100px] md:w-[150px]"
                >
                  Submit
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
