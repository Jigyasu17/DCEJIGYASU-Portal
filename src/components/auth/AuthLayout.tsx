import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  characterImage?: string;
}

const AuthLayout = ({ children, characterImage = "/assets/character.png" }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-white items-center justify-center p-4 overflow-hidden">

      {/* Highly refined, unified container for all 3 elements */}
      <div className="flex w-full max-w-[1400px] h-full min-h-[600px] items-center justify-center relative z-10">

        {/* Left Side: 3D Illustration of Educational Supplies (Large) */}
        <div className="hidden lg:flex w-[40%] h-[75vh] items-center justify-end z-0 pr-4">
          {/* mix-blend-multiply combined with gentle brightness completely eliminates any grayish background boundaries */}
          <img
            src="/assets/supplies.png"
            alt="Educational Supplies"
            className="w-full h-full object-contain object-right mix-blend-multiply contrast-[1.05] brightness-[1.05]"
          />
        </div>

        {/* Center: The Login Form */}
        <div className="w-full max-w-md relative z-20 shrink-0 mx-4">
          {children}
        </div>

        {/* Right Side: Peeking Character (Large, aligned perfectly with the form) */}
        <div className="hidden lg:flex w-[35%] h-[70vh] items-center justify-start z-0 pl-2">
          {/* mix-blend-multiply completely eliminates any grayish background boundaries */}
          <img
            src={characterImage}
            alt="Character pointing"
            className="w-full h-full object-contain object-left mix-blend-multiply contrast-[1.05] brightness-[1.05] -ml-12"
            style={{ transform: "translateY(5%)" }}
          />
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
