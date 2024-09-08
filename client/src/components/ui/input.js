import React from 'react';

export function Input(props) {
  return (
    <input
      {...props}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    />
  );
}