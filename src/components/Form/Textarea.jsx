// src/components/Form/Textarea.jsx
const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
  className = "",
  colSpan = "",
  error = false,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${colSpan}`}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`
          form-field resize-none
          ${error ? 'form-field-error' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Textarea;