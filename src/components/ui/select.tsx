import React from "react";

interface SelectProps {
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  required = false,
  className = "",
  value,
  onChange,
  children,
}) => {
  return (
    <select
      id={id}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3 rounded-xl border border-emerald-200 
        text-emerald-900 bg-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
        transition-all duration-200 hover:border-emerald-300
        ${className}
      `}
    >
      {children}
    </select>
  );
};
