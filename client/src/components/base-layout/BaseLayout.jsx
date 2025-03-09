import React from 'react';
import './base-layout.css';

function BaseLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col overflow-hidden">
      <div className="fixed top-0 left-0 w-full max-w-full overflow-hidden h-[50px] bg-white flex items-center justify-between text-md sm:text-lg p-4 z-50 shadow-md cursor-pointer">
        <h1 className="text-lg sm:text-2xl font-bold">
          Sepak<span className="text-yellow-600">Parrow</span>
        </h1>
        <div className="flex gap-5">
          <div className="hover:bg-gray-200 px-3 py-1 rounded-sm">Home</div>
          <div className="hover:bg-gray-200 px-3 py-1 rounded-sm">Room</div>
          <div className="hover:bg-gray-200 px-3 py-1 rounded-sm">Room</div>
        </div>
        <div className="bg-gray-100 hover:border-blue-600 border-2 rounded-full size-[35px] flex items-center justify-center">
          <i className="fa fa-user fa-sm"></i>
        </div>
      </div>

      <div className="  w-full">{children}</div>

      <div className="h-[50px] bg-white flex items-center justify-center p-4  w-full max-w-full  shadow-[1px_50px_50px_20px_gray]  shadow-gray ">
        © SepakParrow 2025
      </div>
    </div>
  );
}

export default BaseLayout;
