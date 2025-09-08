import React from "react";

interface TextureCardStyledProps {
  children: React.ReactNode;
  className?: string;
}

export const TextureCardStyled: React.FC<TextureCardStyledProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`
      w-full mx-auto
      bg-white rounded-3xl shadow-xl border border-emerald-200
      overflow-hidden backdrop-blur-sm
      ${className}
    `}
    >
      {children}
    </div>
  );
};

interface TextureCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TextureCardHeader: React.FC<TextureCardHeaderProps> = ({
  children,
  className = "",
}) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

interface TextureCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const TextureCardTitle: React.FC<TextureCardTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h2 className={`text-2xl font-bold text-emerald-800 ${className}`}>
      {children}
    </h2>
  );
};

interface TextureCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TextureCardContent: React.FC<TextureCardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

interface TextureCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const TextureCardFooter: React.FC<TextureCardFooterProps> = ({
  children,
  className = "",
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const TextureSeparator: React.FC = () => {
  return <div className="h-px bg-emerald-100"></div>;
};
