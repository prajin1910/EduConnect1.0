import React from "react";

interface InputProps {
  id?: string;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  type = "text",
  required = false,
  className = "",
  placeholder,
  value,
  onChange,
  name,
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3 rounded-xl border border-emerald-200 
        placeholder-emerald-400 text-emerald-900 bg-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
        transition-all duration-200 hover:border-emerald-300
        ${className}
      `}
    />
  );
};
