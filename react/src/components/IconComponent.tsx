import React from "react";
import { IconType } from "react-icons";
import PropTypes from "prop-types";

interface IconStar {
  icon: IconType;
  className?: string;
}

const IconComponent: React.FC<IconStar> = ({ icon: Icon, className }) => {
  const SafeIcon = Icon as unknown as React.FC<{ className?: string }>;
  return <SafeIcon className={className} />;
};

IconComponent.propTypes = {
  icon: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default IconComponent;
