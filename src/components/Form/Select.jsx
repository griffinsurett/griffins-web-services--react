// src/components/Form/Select.jsx
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
  ...props
}) => {
  return (
    <div className={`space-y-2 ${colSpan}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          form-field
          ${error ? 'form-field-error' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" className="form-option">
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className="form-option"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;