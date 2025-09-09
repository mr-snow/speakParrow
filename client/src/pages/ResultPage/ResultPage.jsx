import { Button, Divider, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import LoadSpinner from '../../components/commonComponents/spinner/spinner';

function ResultPage({
  status = '500',
  title = '500',
  subTitle = 'Sorry, something went wrong.',
  backPage = 'Back',
  backLink = -1,
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(backLink);
  };
  return (
    <>
      <div className="bg-white h-screen w-screen flex justify-center items-center cursor-pointer">
        <div className=" h-2/3 w-2/3 lg:w-1/2 border-dashed border-0 flex flex-col justify-center 
        items-center ">
          <LoadSpinner
            type="parrot"
            tip="Error"
            size="large"
            className="bg-red-900 w-fit h-fit py-5 px-8 rounded-[50%] "
          />

          <div className=" relative">
            <h1 className="text-black font-extrabold text-6xl relative">
              {title}
            </h1>
            <div className="absolute top-[-20px] text-2xl right-[-20px] w-[30px] h-[30px]
             flex justify-center items-center">
              {status == 403 ? (
                <i class="fa-solid fa-lock"></i>
              ) : status == 404 ? (
                <i class="fa-solid fa-question"></i>
              ) : (
                <i class="fa-solid fa-exclamation"></i>
              )}
            </div>
          </div>

          <p className="p-4 text-center">{subTitle}</p>
          <Button onClick={handleClick} type="primary">
            {backPage}
          </Button>

          <div className="relative w-full ">
            <Divider
              style={{
                borderColor: 'black',
                color: 'black',
                width: '100%',
                position: 'relative',
                padding: '20px 0',
              }}
            >
              <div
                className="absolute"
                style={{
                  animation: 'doveFly 8s infinite ',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <i className="fa-solid fa-dove text-blue-400 text-3xl"></i>
              </div>
              <div className="relative bg-amber-300 rounded-[50%] w-[30px] h-[30px] flex 
              justify-center items-center">
                {status == 403 ? (
                  <i class="fa-solid fa-lock"></i>
                ) : status == 404 ? (
                  <i class="fa-solid fa-question"></i>
                ) : (
                  <i class="fa-solid fa-exclamation"></i>
                )}
              </div>
            </Divider>

            <style jsx>
              {`
                @keyframes doveFly {
                  0% {
                    transform: translateY(-100%);
                    left: 0;
                  }
                  50% {
                    transform: translateY(-100%) rotateY(180deg);
                    left: 95%;
                  }
                  100% {
                    transform: translateY(-100%);
                    left: 0%;
                  }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResultPage;
