// QuoteFormSection.jsx
import React from "react";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper";
import QuoteForm from "../components/Form/QuoteForm";

/**
 * Section wrapper + heading + animated container for QuoteForm.
 * Pass any QuoteForm props through `formProps`.
 */
export default function QuoteFormSection({
  id = "contact",
  title = "Get A Quote",
  headingBefore = "Ready to Get ",
  headingText = "Started?",
  headingTextClass = "heading-accent-text",
  blurb = "Tell us about your project and we'll provide you with a detailed quote within 24 hours.",

  // Animation props
  animate = true,
  variant = "scale-in",
  animationDuration = 800,
  animationDelay = 120,
  threshold = 0.2,
  rootMargin = "0px",
  once = false,

  // Pass-through to <QuoteForm />
  formProps = {},
}) {
  const FormWrapper = animate ? AnimatedElementWrapper : React.Fragment;
  const wrapperProps = animate
    ? {
        variant,
        animationDuration,
        animationDelay,
        threshold,
        rootMargin,
        once,
      }
    : {};

  return (
    <section className="outer-section bg-bg relative" id={id}>
      <div className="section-color-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>{title}</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before={headingBefore}
            text={headingText}
            textClass={headingTextClass}
          />
          <p className="large-text secondary-text">{blurb}</p>
        </div>

        <FormWrapper {...wrapperProps}>
          <QuoteForm {...formProps} />
        </FormWrapper>
      </div>
    </section>
  );
}
