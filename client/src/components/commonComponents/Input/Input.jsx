import React, { forwardRef } from 'react';

// const Input = forwardRef(({ label, type, ...rest }, ref) => {
//   return (
//     <div className=" flex flex-wrap gap-2 items-start justify-between  w-full pt-2 pb-2 ">
//       <label className=" p-1 text-center">{label || ''}</label>
//       <input
//         type={type || 'text'}
//         className=" p-1 border-1 rounded-sm border-gray-400 "
//         ref={ref}
//         {...rest}
//       />
//     </div>
//   );
// });

const Input = forwardRef(({ label, type, ...rest }, ref) => {
  return (
    <div className="flex flex-wrap gap-2 items-start justify-between w-full pt-2 pb-2">
      <label className="p-1 text-center">{label || ""}</label>
      <input
        ref={ref}   // ✅ forward the ref to actual <input>
        type={type || "text"}
        className="p-1 border-1 rounded-sm border-gray-400"
        {...rest}
      />
    </div>
  );
})

export default Input;
