// import React from 'react';
// import { Spin, Flex } from 'antd';

// const contentStyle = {
//   padding: 50,
//   borderRadius: 4,
// };

// const content = <div style={contentStyle} />;

// const LoadSpinner = () => (
//   <div className="bg-black w-screen h-screen flex justify-center items-center">
//      <Spin tip="Loading"  size='large'  className="custom-spin">
//           {content}
//         </Spin>
//   </div>
// );

// export default LoadSpinner;

// import { Spin } from 'antd';

// const LoadSpinner = ({
//   type = 'flip',
//   size = 'large',
//   tip = 'Loading',
//   className = 'ss',
// }) => {
//   const renderCustomSpinner = () => {
//     switch (type) {
//       case 'orbit':
//         return (
//           <div className="flex items-center justify-center space-x-1">
//             <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
//             <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
//             <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
//           </div>
//         );
//       case 'flip':
//         return (
//           <div style={{ perspective: '120px' }}>
//             <div
//               style={{
//                 width: '40px',
//                 height: '40px',
//                 background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
//                 borderRadius: '8px',
//                 animation: 'flip 1.5s infinite',
//               }}
//             ></div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       <Spin
//         spinning={true}
//         size={size}
//         indicator={renderCustomSpinner()}
//         tip={tip}
//         className={className}
//       />

//       {/* Inline CSS for the flip animation */}
//       <style jsx>{`
//         @keyframes flip {
//           0% {
//             transform: rotateX(0deg) rotateY(0deg)
//           }
//           50% {
//             transform: rotateX(180deg) rotateY(0deg)
//           }
//           100% {
//             transform: rotateX(180deg) rotateY(180deg)
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoadSpinner;

import { Spin } from 'antd';
const LoadSpinner = ({
  type = 'flip',
  size = 'large',
  tip = 'Loading..',
  className = '',
}) => {
  const renderCustomSpinner = () => {
    switch (type) {
      case 'orbit':
        return (
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        );
      case 'flip':
        return (
          <div style={{ perspective: '120px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(131deg, #3B82F6, #8B5CF6)',
                borderRadius: '8px',
                animation: 'flip 1.5s infinite',
              }}
            ></div>
          </div>
        );
      case 'parrot':
        return (
          <div className="flex items-center justify-center">
            <div
              className="w-10 h-10 bg-cover bg-center rounded-md"
              style={{
                backgroundImage: "url('/images/speakParrow.png')",
                animation: 'parrotFlip 2s infinite',
              }}
            ></div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className={`flex justify-center items-center flex-col ${className}`}>
        {renderCustomSpinner()}
        {tip && <div className="text-sm text-white mt-2">{tip}</div>}
      </div>

      {/* Inline CSS for the flip animation */}
      <style jsx>{`
        @keyframes flip {
          0% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(180deg) rotateY(180deg);
          }
        }
        @keyframes parrotFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadSpinner;
