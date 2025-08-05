const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
  className = "",
  colSpan = "",
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
          w-full bg-transparent border border-accent/20 rounded-xl px-4 py-3 
          text-white placeholder-gray-400 
          focus:outline-none focus:border-accent focus:bg-black/70 
          main-duration transition-all resize-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default Textarea;