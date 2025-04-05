import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import BaseLayout from '../../components/base-layout/BaseLayout';
import './Home.css';
import { Select, Space, Modal, Button, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/base-layout/input.jsx/Input';
import { roomHosting, getRooms, addMember } from '../../hooks/roomHost';
import LoadSpinner from '../../components/commonComponents/spinner/spinner';
import { getCountryCode } from '../../utils/basicFunctions';

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

  const [localLoading, setLocalLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState([]);

  const {
    mutate: submitLogin,
    isLoading, // Ensure this is correctly used in UI
  } = useMutation({
    mutationFn: roomHosting,
    onSuccess: data => {
      console.log('Success:', data);
      message.success('Room Created');
      setIsModalOpen(false);
      reset();
      refetch();
    },
    onError: error => {
      console.error('Error:', error);
      message.error(error);
      reset();
    },
  });

  const onSubmit = async data => {
    console.log('final_data', data);
    setLocalLoading(true); // Set loading to true
    submitLogin(data, {
      onSuccess: () => setLocalLoading(false),
      onError: () => setLocalLoading(false),
    });
  };

  // const addToTeam = async room_id => {
  //   const member_id = localStorage.getItem('client_id'); // Get user from localStorage

  //   if (!member_id) {
  //     message.error('Please login..!');
  //     return;
  //   }

  //   try {
  //     const res = await axios.patch(
  //       `http://localhost:5000/room/add-member/${room_id}`,
  //       { member_id }
  //     );

  //     message.success('Added.....');
  //   } catch (err) {
  //     alert(err.response?.data?.message);
  //     console.log(err);
  //   }
  // };

  const { data, refetch } = useQuery({
    queryKey: ['product_data', selectedCountry, selectedLanguage],
    queryFn: () =>
      getRooms({
        user_id: '',
        room_name: '',
        language: selectedLanguage.length ? selectedLanguage.join(',') : '',
        country: selectedCountry.length ? selectedCountry.join(',') : '',
      }),
    enabled: true,
  });

  const addToTeam = room_id => {
    const member_id = localStorage.getItem('client_id');
    if (!member_id) {
      message.error('Please login..!');
      return;
    }
    if (!room_id) {
      message.error('Room ID is missing!');
      return;
    }

    newMemeber({ room_id, member_id });
  };

  const { mutate: newMemeber } = useMutation({
    mutationFn: addMember,
    onSuccess: data => {
      console.log('Success:', data);
      message.success(data?.message || 'Successfully joined the team!');
      refetch();
      if (data?.room._id) {
        const member_id = localStorage.getItem('client_id');
        navigate('/room', {
          state: { room_id: data.room._id, member_id: member_id },
        });
      }
    },
    onError: error => {
      const errorMessage = error.response?.data?.message || 'Failed to join';
      message.error(errorMessage);
      refetch();
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
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a country"
                        options={options2}
                        value={selectedCountry}
                        onChange={value => {
                          field.onChange(value);
                          setSelectedCountry(value); // Update state
                          refetch(); // Refetch rooms
                        }}
                        optionRender={option => (
                          <Space>
                            <span role="img" aria-label={option.data.label}>
                              {option.data.emoji}
                            </span>
                            {option.data.desc}
                          </Space>
                        )}
                        // ✅ Allows dropdown width to be dynamic
                        dropdownStyle={{ minWidth: 150 }}
                      />
                    )}
                  />
                </div>

                <div className="bg-white px-3 py-1 rounded-2xl flex gap-4 w-fit">
                  <p>Language</p>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a language"
                        options={options}
                        value={selectedLanguage}
                        onChange={value => {
                          field.onChange(value);
                          setSelectedLanguage(value); // Update state
                          refetch(); // Refetch rooms
                        }}
                        dropdownStyle={{ minWidth: 150 }}
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

            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 min-h-[70vh]">
              {data?.map((item, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-[#1e293b] to-[#334155] p-4 rounded-xl shadow-md text-white flex flex-col gap-2 justify-between h-[200px] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-white/10 overflow-hidden cursor-pointer"
                  onClick={() => addToTeam(item._id)}
                >
                  {/* Floating Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl opacity-0 hover:opacity-10 transition duration-300"></div>

                  {/* Room Name */}
                  <h1 className="text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-md truncate w-full text-center">
                    {item.room_name}
                  </h1>

                  {/* Team Info */}
                  <div className="text-gray-300 text-xs flex items-center gap-2 truncate">
                    <span className="font-semibold text-white">👥 Team:</span>
                    <span className="truncate">
                      {item.no_of_members} / {item.member_limit}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="text-gray-300 text-xs flex items-center gap-2 truncate">
                    <span className="font-semibold text-white">👤 Owner:</span>
                    <span className="truncate">{item.user_id}</span>
                  </div>

                  {/* Languages */}
                  <div className="text-gray-300 text-xs flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-white">
                      🌍 Languages:
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                      {item.language?.map((lang, i) => (
                        <span
                          key={i}
                          className="bg-blue-600 text-white px-2 py-1 rounded-md text-[10px] font-semibold truncate"
                        >
                          {lang}
                        </span>
                      )) || <span>N/A</span>}
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="text-gray-300 text-xs flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-white">
                      📍 Countries:
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                      {item.country?.map((cty, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md text-[10px] truncate"
                        >
                          {cty}
                        </span>
                      )) || <span>N/A</span>}
                    </div>
                  </div>
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
          className="custom-modal"
        >
          {isLoading || localLoading ? (
            <div className=" w-full h-full flex flex-col justify-center items-center bg-transparent">
              <LoadSpinner />
            </div>
          ) : (
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
                  name="user_id"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'User ID is required' }}
                  render={({ field, fieldState }) => (
                    <div className="flex  flex-col items-center ">
                      <Input label="User ID" {...field} />
                      {fieldState.error && (
                        <p className="error text-red-700  w-fit pl-12  ">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Country Select */}
                <Controller
                  name="country"
                  control={control}
                  // defaultValue={['india']}
                  render={({ field }) => (
                    <div className="flex flex-col items-center w-full ">
                      <p className="font-semibold pb-2">Select Country</p>
                      <Select
                        {...field}
                        className="border-2 bg-transparent"
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a country"
                        options={options2.map(
                          ({ label, value, emoji, desc }) => ({
                            label: (
                              <Space>
                                <span role="img" aria-label={label}>
                                  {emoji}
                                </span>
                                {desc}
                              </Space>
                            ),
                            value,
                          })
                        )}
                      />
                    </div>
                  )}
                />

                {/* Language Select */}
                <Controller
                  name="language"
                  control={control}
                  // defaultValue={['English']}
                  render={({ field }) => (
                    <div className="flex flex-col items-center w-full">
                      <p className="font-semibold pb-2">Select Language</p>
                      <Select
                        {...field}
                        className="border-2"
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select a language"
                        options={options}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="member_limit"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Member limit is required' }}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col items-center ">
                      <Input label="Member Limit" type="number" {...field} />
                      {fieldState.error && (
                        <p className="error text-red-700 w-fit pl-12">
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
          )}
        </Modal>
      </div>
    </BaseLayout>
  );
}

export default Home;
