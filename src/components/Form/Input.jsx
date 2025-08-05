// src/components/Form/Input.jsx
const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
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
          w-full bg-transparent border border-accent/20 rounded-xl px-4 py-3 
          text-white placeholder-gray-400 
          focus:outline-none focus:border-accent focus:bg-black/70 
          main-duration transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Input;