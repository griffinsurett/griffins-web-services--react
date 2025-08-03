import React from 'react';

/**
 * A versatile button/link component.
 *
 * Props:
 *  - variant: 'primary' | 'secondary'        → picks default styling
 *  - href: string                            → if present, renders an <a>, otherwise a <button>
 *  - icon: ReactNode                         → optional icon to render before the text
 *  - className: string                       → append any extra classes
 *  - children: ReactNode                     → button text (wrapped in a <span> internally)
 *  - ...props                                → forwarded to <button> or <a>
 */
const Button = ({
  variant = 'primary',
  href,
  icon,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'button-style button-transition h4 shadow-teal-500/30 inline-flex items-center justify-center space-x-2';
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-black',
    secondary:
      'border-2 border-teal-500 hover:bg-teal-500 hover:text-black text-white',
  };
  const allClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={allClasses} {...props}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }
  return (
    <button className={allClasses} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

export default Button;
