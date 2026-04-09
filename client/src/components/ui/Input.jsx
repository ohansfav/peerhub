import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  className,
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  return (
    <div className="mb-3">
      {label && <label className="font-medium block mb-1">{label}</label>}
      <div className="relative">
        <input
          type={isPasswordField && !showPassword ? "password" : "text"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={
            className
              ? className
              : "w-full px-3 py-1 border input input-bordered rounded pr-10"
          }
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
