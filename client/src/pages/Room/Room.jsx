import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authStore } from '../../store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  exitRoomHook,
  getRoomByIdHook,
  removeMemberHook,
} from '../../hooks/roomHost';
import { getRoomById } from '../../slice/roomSlice';
import { message } from 'antd';

function Room() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isOpenChatBox, setIsOpenChatBox] = useState(false);

  const toggleSidebar = () => setIsOpenChat(prev => !prev);
  const toggleSidebar2 = () => setIsOpenChatBox(prev => !prev);

  const { roomId, user_id, removeRoomId } = authStore();
  const [shouldFetch, setShouldFetch] = useState(false);
  const [exitButton, setExitButton] = useState(false);

  const {
    data: roomDetails,
    isError,
    error,
    isFetched,
  } = useQuery({
    queryKey: ['room/details', roomId],
    queryFn: () => getRoomByIdHook({ room_id: roomId, member_id: user_id }),
  });

  useEffect(() => {
    if (isError) {
      message.error(error?.response?.data?.message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  }, [isError]);

  const { mutate: exitRoom } = useMutation({
    mutationFn: exitRoomHook,
    onSuccess: data => {
      message.success(data?.message || 'You exit from a room');
      removeRoomId(roomId);
      navigate('/');
    },
    onError: error => {
      message.error('Room is Not Available!' || error?.response?.data?.message);
      navigate('/');
    },
  });

  const roomExit = () => {
    exitRoom({ room_id: roomId, member_id: user_id });
  };

  const { mutate: removeMembers } = useMutation({
    mutationFn: removeMemberHook,
    onSuccess: (data, variables) => {
      message.success('member Removed By Owner', variables);
      queryClient.invalidateQueries(['room/Details'], roomId);
    },
    onError: error => {
      message.error(error.message || 'something wrong');
      console.log('test removeMember:', error);
    },
  });

  useEffect(() => {
    if (roomDetails && user_id) {
      const isUserStillMember = roomDetails.room.team_members.some(
        member => member._id === user_id
      );
      if (isUserStillMember) {
        setExitButton(true);
      } else {
        message.info('You have been removed from the room by the owner');
        removeRoomId(roomId);
        navigate('/');
      }
    } else {
      setExitButton(false);
    }
  }, [user_id, roomDetails, roomExit,removeRoomId,roomId]);

  const memberCount = useMemo(() => {
    return roomDetails
      ? `${roomDetails?.room?.team_members?.length}/${roomDetails?.room?.member_limit}`
      : '0/0';
  }, [roomDetails]);

  const removeMember = member => {
    removeMembers({ room_id: roomId, member_id: member, owner_id: user_id });
    console.log('test remove member : ', member);
  };

  return (
    <div>
      <div className="roomContainer bg-[#151515] w-full h-full  flex flex-col md:flex-row  ">
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-2 left-2 z-50 bg-blue-400 p-2 rounded-2xl size-10 flex justify-center items-center"
        >
          <i class="fa-solid fa-users"></i>
        </button>

        <button
          onClick={toggleSidebar2}
          className="md:hidden fixed top-2 right-2 z-50 bg-blue-400 p-2 rounded-2xl size-10 flex justify-center items-center"
        >
          <i class="fa-brands fa-rocketchat"></i>
        </button>

        <section
          id="members__container"
          className={`
          fixed top-0 left-0 h-screen  z-40 transition-all duration-300 ease-in-out
          ${isOpenChat ? 'w-1/2' : 'w-0'}
          overflow-hidden
          md:static md:w-1/5 md:block md:overflow-auto
        `}
        >
          <div className="bg-[var(--color-bg)] text-[var(--color-text)]  h-2/11 flex justify-center items-center flex-col">
            <h2 className="text-lg sm:text-2xl font-bold">
              {roomDetails?.room?.room_name}
            </h2>
            <div className="text-sm sm:text-md font-semibold ">
              Hosted by {roomDetails?.room?.user_id?.username}
              <i className="fa-solid fa-wifi px-2"></i>
            </div>
          </div>

          <div
            id="members__header"
            className="bg-[#262724] w-full h-1/11 text-center text-white flex justify-center items-center gap-2"
          >
            <i class="fa-solid fa-users"></i>
            <p>Participants</p>
            <strong id="members__count">{memberCount}</strong>
          </div>

          <div
            id="member__list"
            className="customScrollbar bg-[#323043] text-center h-8/11 w-full "
          >
            {roomDetails?.room?.team_members?.length > 0 ? (
              <div>
                {roomDetails?.room?.team_members.map(member => (
                  <div className="member__wrapper member__1__wrapper  text-white p-3  h-fit text-left flex gap-2 ">
                    <p class="member_name  flex justify-center items-center gap-2">
                      <i
                        key={member._id}
                        className="px-2 fa-solid fa-user  opacity-95 text-green-600"
                      >
                        {' '}
                      </i>

                      {member.username}
                      {roomDetails?.isOwner && (
                        <i
                          className="custom-xmark custom-submit-btn  fa-solid fa-circle-xmark text-red-900 bg-amber-300 text-xl  "
                          onClick={() => removeMember(member._id)}
                        ></i>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No team members yet</p>
            )}
          </div>
        </section>

        <section id="stream__container" className=" w-full  md:w-3/5 h-screen ">
          <div className=" h-9/10 flex justify-center items-center ">
            <div className="bg-black w-[95%] h-[95%]">
              <div className="bg-red-500"></div>
            </div>
          </div>
          <div class="stream__actions  h-1/10 flex justify-center items-start">
            <div className="stream_actButton  w-fit flex gap-5 ">
              <button className="bg-purple-600 px-3 py-2 rounded-xl hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ fill: 'white' }}
                >
                  <path d="M5 4h-3v-1h3v1zm10.93 0l.812 1.219c.743 1.115 1.987 1.781 3.328 1.781h1.93v13h-20v-13h3.93c1.341 0 2.585-.666 3.328-1.781l.812-1.219h5.86zm1.07-2h-8l-1.406 2.109c-.371.557-.995.891-1.664.891h-5.93v17h24v-17h-3.93c-.669 0-1.293-.334-1.664-.891l-1.406-2.109zm-11 8c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1zm7 0c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z" />
                </svg>
              </button>

              <button className=" bg-purple-600 px-3 py-2 rounded-xl hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ fill: 'white' }}
                >
                  <path d="M12 2c1.103 0 2 .897 2 2v7c0 1.103-.897 2-2 2s-2-.897-2-2v-7c0-1.103.897-2 2-2zm0-2c-2.209 0-4 1.791-4 4v7c0 2.209 1.791 4 4 4s4-1.791 4-4v-7c0-2.209-1.791-4-4-4zm8 9v2c0 4.418-3.582 8-8 8s-8-3.582-8-8v-2h2v2c0 3.309 2.691 6 6 6s6-2.691 6-6v-2h2zm-7 13v-2h-2v2h-4v2h10v-2h-4z" />
                </svg>
              </button>

              <button className="bg-gray-600 px-3 py-2 rounded-xl hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ fill: 'white' }}
                >
                  <path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z" />
                </svg>
              </button>

              {exitButton && (
                <button
                  className="bg-red-500 px-3 py-2 rounded-xl hover:scale-110"
                  onClick={roomExit}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    style={{ fill: 'white' }}
                  >
                    <path d="M16 10v-5l8 7-8 7v-5h-8v-4h8zm-16-8v20h14v-2h-12v-16h12v-2h-14z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          id="messages__container"
          className={`bg-[#323043] 
            fixed top-0 right-0 h-screen  z-40 transition-all duration-300 ease-in-out
            ${isOpenChatBox ? 'w-[300px]' : 'w-0'}
            overflow-hidden
            md:static md:w-1/5 md:block md:overflow-auto flex flex-col justify-between 
          `}
        >
          <div className="relative md:w-full  h-full  ">
            <div
              id="messages"
              className="p-2 box-border absolute top-0     w-full h-8/11 customScrollbar py-1 flex flex-col gap-2 pb-10"
            >
              <div class="message__wrapper  p-1 ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot bg-[#353739] p-1  text-white text-sm pl-6 rounded-b-md">
                    Welcome to the room, Don't be shy, say hello!
                  </p>
                </div>
              </div>

              <div class="message__wrapper ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot text-white text-sm pl-6">
                    Welcome to the room, Don't be shy, say hello!
                  </p>
                </div>
              </div>
              <div class="message__wrapper ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot text-white text-sm pl-6">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Dolorem laborum numquam expedita. Blanditiis temporibus sit
                    eaque quam a! Mollitia id iste deserunt quod blanditiis
                    itaque nobis cupiditate rem nostrum ducimus!
                  </p>
                </div>
              </div>
              <div class="message__wrapper ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot text-white text-sm pl-6">
                    Welcome to the room, Don't be shy, say hello!333333333
                  </p>
                </div>
              </div>

              <div class="message__wrapper ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot text-white text-sm pl-6">
                    Welcome to the room, Don't be shy, say hello!2222222
                  </p>
                </div>
              </div>

              <div class="message__wrapper ">
                <div class="message__body__bot">
                  <strong class="message__author__bot text-purple-700">
                    🤖 Mumble Bot
                  </strong>
                  <p class="message__text__bot text-white text-sm pl-6">
                    Welcome to the room, Don't be shy, say hello!111111111
                  </p>
                </div>
              </div>
            </div>

            <div className="bottom-0 absolute w-full md:w-full bg-red-700 h-3/11">
              <form
                id="message__form"
                className="p-2 bg-[#272727]  bottom-2 flex flex-col gap-2 items-center md:w-full h-full  "
              >
                <textarea
                  type="text"
                  name="message"
                  placeholder="Send a message..."
                  className="flex-1 px-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-400 w-3/4 text-white"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white h-[40px] rounded-md hover:bg-blue-600 transition w-1/4"
                >
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Room;
