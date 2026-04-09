const Button = ({
  type = "button",
  onClick,
  children,
  className = "",
  disabled = false,
  loading = false,
}) => {
  const baseStyles = "px-4 py-2 rounded-full font-medium w-full";
  const enabledStyles = "bg-blue-500 text-white hover:bg-blue-600";
  const disabledStyles = "bg-gray-400 text-white cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${
        disabled || loading ? disabledStyles : enabledStyles
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-1">
          <span className="loading loading-spinner loading-xs" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
