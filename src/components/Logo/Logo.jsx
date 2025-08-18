import React from "react";
import TextLogo from "./TextLogo";
import VideoLogo from "./VideoLogo";

/**
 * Logo component renders a linked logo section combining the animated video logo
 * and the text logo side by side.
 */
const Logo = ({ loading = "lazy" }) => {
  return (
    <a href="/" className="flex justify-center items-center gap-1.5">
      <VideoLogo alt="Griffin's Web Services Animated Logo" loading={loading} />
      <div>
        <TextLogo
          title="Griffin's Web Services"
          className="flex flex-col p-0 m-0"
          loading={loading}
        />
      </div>
    </a>
  );
};

export default Logo;
