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
          w-full bg-transparent border border-accent/20 rounded-xl px-4 py-3 
          text-white 
          focus:outline-none focus:border-accent focus:bg-black/70 
          main-duration transition-all
          ${className}
        `}
        {...props}
      >
        <option value="" className="bg-black text-white">
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className="bg-black text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;