import React, { useEffect } from 'react';
import './base-layout.css';
import CustomDrawer from '../commonComponents/Drawer/Drawer';
import { useThemeStore } from '../../store/themestore';
import { useNavigate } from 'react-router-dom';

function BaseLayout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-white flex flex-col overflow-hidden">
      <div
        className="fixed top-0 left-0 w-full max-w-full overflow-hidden h-[50px]  flex items-center justify-between  sm:text-lg p-4 z-50 shadow-md cursor-pointer  px-3 py-1 
          bg-[var(--color-bg)] text-[var(--color-text)]"
      >
        <h1 className="text-lg sm:text-2xl font-bold">
          Sepak<span className="text-yellow-600">Parrow</span>
        </h1>
        <div className="flex gap-5">
          <div
            className="hover:bg-[var(--color-hover)] px-3 py-1 rounded-sm 
          bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            {' '}
            Home{' '}
          </div>
          <div
            className="hover:bg-[var(--color-hover)] px-3 py-1 rounded-sm 
          bg-[var(--color-bg)] text-[var(--color-text)]"
          >
            {' '}
            Room{' '}
          </div>
          <div
            className="hover:bg-[var(--color-hover)] px-3 py-1 rounded-sm 
          bg-[var(--color-bg)] text-[var(--color-text)]"
            onClick={() => navigate('/test')}
          >
            {' '}
            TestPage
          </div>
        </div>
        <div className="   flex items-center justify-center">
          <CustomDrawer
            props={{
              details: 'some',
              title: 'Account',
              icon: 'fa fa-user fa-sm',
            }}
          ></CustomDrawer>
        </div>
      </div>

      <div className="  w-full bg-[var(--color-bg2)]  ">{children}</div>

      <div
        className={`h-[50px]  flex items-center bg-[var(--color-bg)] text-[var(--color-text)]  justify-center p-4  w-full max-w-full    shadow-gray `}
      >
        © SepakParrow 2025
      </div>
    </div>
  );
}

export default BaseLayout;
