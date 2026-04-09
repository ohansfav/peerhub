import { useRef } from "react";
import toast from "react-hot-toast";

const FileUpload = ({ onChange, accept = ".pdf,.jpg,.jpeg,.png" }) => {
  const inputRef = useRef(null);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) onChange(file);
  // };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //file type
      const allowedFormat = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedFormat.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPEG, JPG, PNG, or PDF file."
        );
        e.target.value = "";
        return;
      }

      if (file.size > maxFileSize) {
        toast.error("File size exceeds the 5MB limit.");
        e.target.value = "";
        return;
      }

      onChange(file);
    }
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center 
        w-full border-2 border-dashed border-gray-300 
        rounded-lg p-6 
        hover:border-indigo-400 
        transition cursor-pointer
      "
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      <svg
        width="64px"
        height="64px"
        viewBox="-3.12 -3.12 30.24 30.24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            d="M3 10V18C3 19.1046 3.89543 20 5 20H12M3 10V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V10M3 10H21M21 10V13"
            stroke="#000000"
            stroke-width="1.056"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
          <path
            d="M17.5 21L17.5 15M17.5 15L20 17.5M17.5 15L15 17.5"
            stroke="#000000"
            stroke-width="1.056"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>{" "}
          <circle cx="6" cy="7" r="1" fill="#000000"></circle>{" "}
          <circle cx="9" cy="7" r="1" fill="#000000"></circle>{" "}
        </g>
      </svg>
      <div className="text-center">
        <p className="text-gray-600 font-medium">
          <span className="text-primary hover:underline font-bold">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="text-text text-sm mt-1">(Max size. 5MB)</p>
      </div>
    </div>
  );
};

export default FileUpload;
