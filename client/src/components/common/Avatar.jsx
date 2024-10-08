import React from "react";
import Avatar from "react-avatar";

const AvatarComp = ({ name, color, size }) => {
  /* Avatar comp here */

  // const index = Math.floor(Math.random() * colors.length);
  return (
    <Avatar
      className="avatar-small"
      name={name}
      round
      size={size || "35"}
      // color={color}
      fgColor="white"
      textSizeRatio={1.75}
    />
  );
};

export default AvatarComp;
