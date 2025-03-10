import React from 'react';

export default function Input({ label, type,...rest }) {
  return (
    <div className=" flex flex-wrap gap-2 items-start justify-between  w-full pt-2 pb-2 ">
      <label className=" p-1 text-center">{label || ''}</label>
      <input
        type={type || 'text'}
        className=" p-1 border-1 rounded-sm border-gray-400 " 
        {...rest}
      />
    </div>
  );
}
