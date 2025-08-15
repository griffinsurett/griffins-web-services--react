// src/components/Form/Select.jsx
import React, { useState, useCallback } from "react";
import AnimatedBorder from "../AnimatedBorder";

const Select = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = "",
  colSpan = "",
  error = false,
  borderDuration = 900,
  borderWidth = 2,
  borderRadius = "rounded-xl",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((e) => {
    setFocused(true);
    props.onFocus?.(e);
  }, [props]);

  const handleBlur = useCallback((e) => {
    setFocused(false);
    props.onBlur?.(e);
  }, [props]);

  return (
    <div className={`space-y-2 ${colSpan}`}>
      <AnimatedBorder
        variant="solid"
        triggers="controlled"
        active={focused}
        duration={borderDuration}
        borderWidth={borderWidth}
        borderRadius={borderRadius}
        color="var(--color-accent)"
        innerClassName={`!bg-transparent !border-transparent p-0 ${borderRadius}`}
      >
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            form-field
            ${error ? "form-field-error" : ""}
            ${className}
          `}
          {...props}
        >
          <option value="" className="form-option">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="form-option">
              {option.label}
            </option>
          ))}
        </select>
      </AnimatedBorder>
    </div>
  );
};

export default Select;
