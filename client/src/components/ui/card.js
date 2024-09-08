import React from 'react';

export function Card({ children, className, ...props }) {
  return (
    <div className={`bg-white shadow-md rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}