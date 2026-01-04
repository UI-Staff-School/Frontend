"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    time: "10:00 AM - 12:00 PM",
    description: "Annual parent-teacher conference for all classes.",
  },
  {
    id: 2,
    title: "Sports Day",
    time: "8:00 AM - 4:00 PM",
    description: "Inter-house sports competition for all students.",
  },
  {
    id: 3,
    title: "Term Examination Begins",
    time: "9:00 AM",
    description: "First term examination starts for all classes.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900">Calendar</h1>
        </div>
      </div>

      <div className="[&_.react-calendar]:border-none [&_.react-calendar]:w-full [&_.react-calendar]:font-sans [&_.react-calendar__tile--active]:bg-green-500 [&_.react-calendar__tile--active]:rounded-lg [&_.react-calendar__tile--now]:bg-green-100 [&_.react-calendar__tile--now]:rounded-lg [&_.react-calendar__tile]:rounded-lg [&_.react-calendar__tile:hover]:bg-gray-100 [&_.react-calendar__navigation__label]:font-semibold [&_.react-calendar__navigation__label]:text-gray-900 [&_.react-calendar__navigation button]:rounded-lg [&_.react-calendar__navigation button:hover]:bg-gray-100 [&_.react-calendar__month-view__weekdays]:text-xs [&_.react-calendar__month-view__weekdays]:text-gray-500 [&_.react-calendar__month-view__weekdays]:font-medium">
        <Calendar onChange={onChange} value={value} />
      </div>

      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Upcoming Events</h2>
        <button className="text-xs text-green-600 hover:text-green-700 font-medium">View All</button>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event, index) => (
          <div
            className={`p-4 rounded-xl border-l-4 bg-gray-50 ${
              index % 3 === 0 ? 'border-l-green-500' :
              index % 3 === 1 ? 'border-l-blue-500' : 'border-l-amber-500'
            }`}
            key={event.id}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">{event.time}</span>
            </div>
            <p className="mt-1.5 text-gray-500 text-xs">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
