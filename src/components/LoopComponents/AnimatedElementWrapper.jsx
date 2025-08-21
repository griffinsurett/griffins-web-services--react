// src/components/LoopComponents/AnimatedElementWrapper.jsx
import React, { forwardRef } from "react";
import { useAnimatedElement } from "../../hooks/useAnimatedElement";

/**
 * AnimatedElementWrapper
 * - Class-agnostic: you choose the animation class(es) via `variant`
 * - Hook only supplies CSS variables + data attributes (no class mangling)
 * - Works with any animation defined in animations.css that reads:
 *     --animation-duration, --animation-delay, --animation-easing,
 *     --animation-progress, --animation-progress-decimal, --animation-direction
 *
 * Example CSS contract:
 * .animated-element.scale-in {
 *   opacity: var(--animation-progress-decimal, 0);
 *   transform: scale(calc(0.5 + (var(--animation-progress-decimal, 0) * 0.5)));
 *   transition:
 *     transform var(--animation-duration, 600ms) var(--animation-easing, ease),
 *     opacity   var(--animation-duration, 600ms) var(--animation-easing, ease);
 * }
 */
const AnimatedElementWrapper = forwardRef(function AnimatedElementWrapper(
  {
    as: Component = "div",
    children,
    className = "",
    // one or multiple classes; string or array
    variant = "scale-in",
    // timing (JS sets vars, CSS consumes)
    animationDuration = 600,
    animationDelay = 0,
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    // visibility config
    threshold = 0.2,
    rootMargin = "0px 0px -50px 0px",
    once = false,
    // pass-through style/props
    style,
    ...rest
  },
  ref
) {
  const anim = useAnimatedElement({
    ref,
    duration: animationDuration,
    delay: animationDelay,
    easing,
    threshold,
    rootMargin,
    once,
  });

  // allow variant as array or space-separated string
  const variantClasses = Array.isArray(variant)
    ? variant.filter(Boolean).join(" ")
    : String(variant || "");

  // merge styles: animation vars first, caller overrides last
  const mergedStyle = { ...anim.style, ...style };

  return (
    <Component
      ref={anim.ref}
      className={`animated-element ${variantClasses} ${className}`.trim()}
      {...anim.props}          // data-visible, data-animation-direction, base style vars
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default AnimatedElementWrapper;
