"use client";

import React from "react";
import TrackerCalendar from "./components/TrackerCalendar";

const TrackerPage = () => {
  return (
    <div className="flex-1 overflow-hidden h-full">
      <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-6 md:py-6">
        <div className="ml-2 mb-6 mt-2 md:mt-0 md:mb-4 text-2xl font-bold text-yellow-600 dark:text-neutral-100">
          Your Daily Tracker
        </div>

        <TrackerCalendar />
      </div>
    </div>
  );
};

export default TrackerPage;
