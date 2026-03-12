import React from "react";

interface PlaceholderImageProps {
  text: string;
  className?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  text,
  className = "",
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ${className}`}
    >
      <span className="text-white font-bold text-center px-4">{text}</span>
    </div>
  );
};

export default PlaceholderImage;
