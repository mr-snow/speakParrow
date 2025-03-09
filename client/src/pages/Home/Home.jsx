import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import BaseLayout from '../../components/base-layout/BaseLayout';
import './Home.css';
import { Select, Space, Modal, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/base-layout/input.jsx/Input';

const options = [
  { label: 'English', value: 'English' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Malayalam', value: 'Malayalam' },
  { label: 'Hindi', value: 'Hindi' },
];

const options2 = [
  { label: 'China', value: 'china', emoji: '🇨🇳', desc: 'China (中国)' },
  { label: 'India', value: 'india', emoji: '🇮🇳', desc: 'India (印度)' },
  { label: 'Japan', value: 'japan', emoji: '🇯🇵', desc: 'Japan (日本)' },
  { label: 'Korea', value: 'korea', emoji: '🇰🇷', desc: 'Korea (韩国)' },
];

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { control, handleSubmit, reset, setValue, register } = useForm();

  const onSubmit = async data => {
    console.log('final_data', data);
    // navigate(`/index?room=${data.room}`);
    submintLogin(data);
  };

  const { data } = useQuery({
    queryKey: ['product_data'],
    queryFn: async () => {
      const response = await axios.get('https://fakestoreapi.com/products');
      return response.data;
    },
  });

  return (
    <BaseLayout>
      <div
        className="mainDi h-full w-full p-5 box-border"
        style={{ marginTop: '50px' }}
      >
        <div className="w-full min-h-[85vh] p-4 box-border">
          <div className="bg-gray-300 h-full rounded-tl-md rounded-tr-md flex flex-col p-5 box-border">
            <div className="h-auto flex flex-wrap justify-between px-5 gap-5 py-1 rounded-tl-2xl rounded-tr-2xl flex-col sm:flex-row">
              <div className="gap-5 w-fit h-fit flex flex-wrap">
                <div className="bg-white px-3 py-1 rounded-2xl flex gap-4 w-fit h-fit">
                  <p>Country</p>
                  <Controller
                    name="country"
                    control={control}
                    defaultValue={['India']}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a country"
                        options={options2}
                        optionRender={option => (
                          <Space>
                            <span role="img" aria-label={option.data.label}>
                              {option.data.emoji}
                            </span>
                            {option.data.desc}
                          </Space>
                        )}
                      />
                    )}
                  />
                </div>

                <div className="bg-white px-3 py-1 rounded-2xl flex gap-4 w-fit">
                  <p>Language</p>
                  <Controller
                    name="language"
                    control={control}
                    defaultValue={['English']}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a language"
                        options={options}
                      />
                    )}
                  />
                </div>
              </div>
              <Button
                type="primary"
                onClick={() => setIsModalOpen(true)}
                className="w-fit"
              >
                Create
              </Button>
            </div>
            <div className="w-full grid grid-cols-2 pt-5 md:grid-cols-4 gap-2 sm:gap-5 min-h-[70vh]">
              {data &&
                data.map((item, index) => (
                  <div
                    key={index}
                    className="roomCard bg-blue-950 h-[150px] sm:h-[180px] md:h-[200px] text-white flex justify-center items-center"
                  >
                    <div className="cardImg">{item.title}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <Modal
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <div
            id="form__content__wrapper"
            className="flex flex-col justify-center  items-center gap-2"
          >
            <form id="join-form" onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-center text-xl font-bold pb-5">
                Hosting Rooms
              </h2>
              <Controller
                name="room_name"
                control={control}
                defaultValue=""
                rules={{ required: 'Room name is required' }}
                render={({ field, fieldState }) => (
                  <div className="flex  flex-col items-center ">
                    <Input label="Room Name" {...field} />
                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="user_name"
                control={control}
                defaultValue=""
                rules={{ required: 'User name is required' }}
                render={({ field, fieldState }) => (
                  <div className="flex  flex-col items-center ">
                    <Input label="User Name" {...field} />
                    {fieldState.error && (
                      <p className="error text-red-700  w-fit pl-12  ">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className=" flex justify-center items-center pt-5 ">
                <input
                  type="submit"
                  value="Join Room"
                  className="bg-blue-500 text-white px-4 py-2 rounded w-fit  "
                />
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </BaseLayout>
  );
}

export default Home;
