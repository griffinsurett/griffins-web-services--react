// src/components/Form/Input.jsx
const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  error = false,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          form-field
          ${error ? 'form-field-error' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;
