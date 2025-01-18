import { Link } from "react-router-dom";
import logo from "../assets/logo.png"; // Import the logo image

const Start = () => {
  return (
    <div>
      <div className="relative h-screen">
        {/* Video Background */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
        >
          <source
            src="https://videos.pexels.com/video-files/3028396/3028396-sd_640_360_24fps.mp4"
            type="video/mp4"
          />
        </video>

        <div className="pt-5 pb-5 flex flex-col justify-between h-full">
          <div className="flex justify-center items-center relative z-10">
            <img
              className="h-[150px] w-[150px]"
              src={logo}
              alt="Fitknight Logo"
            />
            <div>
              <span className="text-red-500 text-4xl font-extrabold">
                FITKNIGHT
              </span>
            </div>
          </div>

          <div className="bg-white pb-7 py-4 px-4 relative z-10">
            <h2 className="text-3xl font-bold">
              Get Started with your{" "}
              <span className="text-red-500 text-4xl font-extrabold">
                FITNESS JOURNEY
              </span>
            </h2>
            <Link
              to="/userLogin"
              className="bg-black text-white py-2 w-full rounded-lg pl-5 pr-5 my-4 text-center block"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
