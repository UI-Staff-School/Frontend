const announcements = [
  {
    id: 1,
    title: "New Academic Calendar Released",
    date: "2025-01-15",
    description: "The academic calendar for the 2024/2025 session has been released. Please check the school portal.",
    type: "info",
  },
  {
    id: 2,
    title: "Fee Payment Deadline",
    date: "2025-01-20",
    description: "All outstanding fees must be paid before the end of this month to avoid late payment charges.",
    type: "warning",
  },
  {
    id: 3,
    title: "Examination Results",
    date: "2025-01-10",
    description: "First term examination results are now available. Parents can access them through the portal.",
    type: "success",
  },
];

const Announcements = () => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-l-green-500";
      case "warning":
        return "bg-amber-50 border-l-amber-500";
      default:
        return "bg-blue-50 border-l-blue-500";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900">Announcements</h1>
        </div>
        <button className="text-xs text-green-600 hover:text-green-700 font-medium">View All</button>
      </div>

      <div className="flex flex-col gap-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`rounded-xl p-4 border-l-4 ${getTypeStyles(announcement.type)}`}
          >
            <div className="flex items-start justify-between">
              <h2 className="font-medium text-gray-900 text-sm">{announcement.title}</h2>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg shrink-0 ml-2">
                {announcement.date}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
              {announcement.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
