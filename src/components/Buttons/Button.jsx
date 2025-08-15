// src/components/buttons/Button.jsx
import React from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import UnderlineLink from "./UnderlineLink";

/** ─────────────────────────────────────────────────────────────
 * ButtonBase
 * - Renders <a> when a nav target exists, else <button>.
 * - Accepts navigation via: href | link | to (aliases).
 * - Supports custom components via `as`:
 *      <Button as={Link} to="/about">    // react-router
 *      <Button as="a" href="/about">     // explicit <a>
 *      <Button href="/about">            // implicit <a>
 * - Icon slots: leftIcon / rightIcon (legacy `icon` maps to leftIcon).
 */
export const ButtonBase = ({
  href,
  link,
  to,
  as: As,                 // string tag or React component
  kind = "button",        // "button" | "link"
  className = "",
  leftIcon,
  rightIcon,
  icon,                   // alias for leftIcon
  children,
  ...props
}) => {
  // Resolve a single nav target (used when we render <a> implicitly)
  const navTarget = href ?? link ?? to;

  let Tag;
  let tagProps = { ...props };

  if (As) {
    // Custom renderer supplied
    Tag = As;

    if (typeof As === "string") {
      // e.g., "a", "button"
      if (As.toLowerCase() === "a") {
        // Cleanly pass only href to <a>
        const { type, ...rest } = tagProps; // strip `type` if present
        tagProps = { href: navTarget, ...rest };
      }
      // else: some other intrinsic element ("button", "div") → let caller manage props
    } else {
      // React component (e.g., react-router Link, Next.js Link)
      // Prefer `to` for router Links; otherwise provide `href`
      if (to != null || link != null) {
        tagProps = { ...tagProps, to: to ?? link ?? href };
      } else if (href != null) {
        tagProps = { ...tagProps, href };
      }
    }
  } else {
    // No custom renderer: pick <a> if we have a target, else <button>
    Tag = navTarget ? "a" : "button";
    if (navTarget) {
      const { type, ...rest } = tagProps; // avoid button-only attrs on <a>
      tagProps = { href: navTarget, ...rest };
    }
  }

  // Base styles
  const baseButton =
    "button-style button-transition h4 shadow-accent/30 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full";
  const baseLink = "inline-flex items-center gap-1 font-medium";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70";

  const baseClasses = kind === "link" ? baseLink : baseButton;

  return (
    <Tag className={`${baseClasses} ${focusRing} ${className}`.trim()} {...tagProps}>
      {leftIcon || icon ? <span className="inline-flex">{leftIcon || icon}</span> : null}
      {children}
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
    </Tag>
  );
};

/** Variant router */
const VARIANT_MAP = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  link: UnderlineLink,
  underline: UnderlineLink, // alias
};

/**
 * Public Button
 * Routes to the appropriate variant component.
 * We inject ButtonBase so variants don’t import it (avoid cycles).
 */
const Button = ({ variant = "primary", ...props }) => {
  const VariantComp = VARIANT_MAP[variant] || PrimaryButton;
  return <VariantComp Base={ButtonBase} {...props} />;
};

export default Button;
