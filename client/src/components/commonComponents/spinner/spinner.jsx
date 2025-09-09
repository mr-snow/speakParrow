const LoadSpinner = ({
  type = 'flip',
  size = 'medium',
  tip = 'Loading..',
  className = '',
}) => {
  // Size configuration
  const sizeConfig = {
    small: {
      container: 'w-5 h-5',
      text: 'text-xs',
      custom: 20, // pixels for custom spinners
    },
    medium: {
      container: 'w-10 h-10',
      text: 'text-sm',
      custom: 40,
    },
    large: {
      container: 'w-16 h-16 ',
      text: 'text-2xl font-bold ',
      custom: 64,
    },
  };


  const currentSize = sizeConfig[size] || sizeConfig.large;

  const renderCustomSpinner = () => {
    switch (type) {
      case 'orbit':
        return (
          <div
            className={`flex items-center justify-center space-x-1 ${currentSize.container}`}
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        );
      case 'flip':
        return (
          <div
            style={{ perspective: '120px' }}
            className={currentSize.container}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(131deg, #3B82F6, #8B5CF6)',
                borderRadius: '8px',
                animation: 'flip 1.5s infinite',
              }}
            ></div>
          </div>
        );
      case 'parrot':
        return (
          <div
            className={`flex items-center justify-center ${currentSize.container}`}
          >
            <div
              className="w-full h-full bg-cover bg-center rounded-md "
              style={{
                backgroundImage:"var(--logo)",
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
      <div className={`flex justify-center items-center flex-col  ${className}`}>
        {renderCustomSpinner()}
        {tip && (
          <div className={`${currentSize.text} text-white mt-2 `}>{tip}</div>
        )}
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
