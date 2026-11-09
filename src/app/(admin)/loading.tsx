import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-3 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="skeleton h-80 rounded-3xl" />
        <div className="skeleton h-80 rounded-3xl" />
      </div>
      <div className="skeleton h-64 rounded-3xl" />
    </div>
  );
}
