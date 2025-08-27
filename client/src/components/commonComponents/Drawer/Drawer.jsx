import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../../../store/themestore';

import {
  AlignLeftOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Drawer,
  Menu,
  Switch,
  ConfigProvider,
  theme as antdTheme,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userLogoutHook } from '../../../hooks/userHook';
const { darkAlgorithm, defaultAlgorithm } = antdTheme;

const CustomDrawer = ({ props }) => {
  const [open, setOpen] = useState(false || props.open);
  const navigate = useNavigate();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const { appTheme, toggleTheme } = useThemeStore();

  //   const [theme, setTheme] = useState('dark');
  const [current, setCurrent] = useState('1');
  //   const changeTheme = value => {
  //     setTheme(value ? 'dark' : 'light');
  //   };

  const onClick = e => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const items = [
    {
      key: 'sub1',
      label: 'Profile',
      icon: <UserOutlined />,
      children: [
        { key: '1', label: 'Option 1' },
        { key: '2', label: 'Option 2' },
        {
          key: 'sub4',
          label: 'Submenu',
          children: [
            { key: '7', label: 'Option 7' },
            { key: '8', label: 'Option 8' },
          ],
        },
      ],
    },
    {
      key: 'sub2',
      label: 'Activity',
      icon: <AlignLeftOutlined />,
      children: [{ key: '3', label: 'Option 1' }],
    },
    {
      key: 'sub3',
      label: 'settings',
      icon: <SettingOutlined />,
      children: [
        {
          key: '4',
          label: (
            <div onClick={e => e.stopPropagation()}>
              <span>Change Theme </span>
              <Switch
                checked={appTheme === 'dark'}
                onChange={toggleTheme}
                checkedChildren="Dark"
                unCheckedChildren="Light"
              />
            </div>
          ),
        },
      ],
    },
  ];

  const { mutate: userLogout } = useMutation({
    queryKey: ['user/logout'],
    mutationFn: userLogoutHook,
    onSuccess: data => {
      navigate('/');
      message.warning('user Logout');
      ['token', 'id', 'username'].forEach(key => localStorage.removeItem(key));
      onClose();
    },
    onError: error => {
      message.error(error.message);
    },
  });

  const userLogutFn = () => {
    userLogout();
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        {props.icon ? <i className={props.icon} /> : 'Open '}
      </Button>
      <ConfigProvider
        theme={{
          algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <Drawer
          theme={appTheme}
          title={props.title ? props.title : 'Basic '}
          closable={{ 'aria-label': 'Close Button' }}
          onClose={onClose}
          open={open}
        >
          <div className="bg-red-10">
            <Menu
              onClick={onClick}
              style={{
                width: '100%',
                backgroundColor: appTheme === 'dark' ? 'dark' : 'light',
              }}
              selectedKeys={[current]}
              mode="inline"
              items={items}
            />
          </div>

          <br />
          <br />
          <Divider />
          <Button
            type="link"
            block
            style={{
              border: '1px solid gray',
              marginBottom: '10px',
            }}
            onClick={() => navigate('/Login')}
          >
            Login / signUp
            <i class="fa-solid fa-hands"></i>
          </Button>

          <Button
            type="link"
            block
            style={{
              border: '1px solid gray',
            }}
            onClick={() => userLogutFn()}
          >
            Logout
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </Button>
        </Drawer>
      </ConfigProvider>
    </>
  );
};
export default CustomDrawer;
