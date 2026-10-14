import React from 'react';

interface IQBSLogoProps {
  className?: string;
  showText?: boolean;
}

export const IQBSLogo: React.FC<IQBSLogoProps> = ({
  className = 'w-10 h-10',
  showText = false,
}) => {
  if (showText) {
    return (
      <img
        src="./logo-iqbs.svg"
        alt="Logo IQBS"
        className={`${className} object-contain`}
      />
    );
  }

  return (
    <img
      src="./favicon.svg"
      alt="Logo IQBS Emblem"
      className={`${className} object-contain drop-shadow-md`}
    />
  );
};
