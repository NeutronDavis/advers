import React from "react";

export default function BoosterLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-3 w-36" />
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-3 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 skeleton h-80 rounded-3xl" />
        <div className="skeleton h-80 rounded-3xl" />
      </div>
    </div>
  );
}
