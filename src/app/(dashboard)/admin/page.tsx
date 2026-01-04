import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import SessionInfoCard from "@/components/SessionInfoCard";
import QuickStats from "@/components/QuickStats";

const AdminPage = () => {
  return (
<<<<<<< HEAD
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="alumni" />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart />
          </div>
        </div>

        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
=======
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here is what is happening at your school.</p>
>>>>>>> habyaad_dev
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3 flex flex-col gap-6">
          {/* USER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UserCard type="student" />
            <UserCard type="teacher" />
            <UserCard type="parent" />
            <UserCard type="alumni" />
          </div>

          {/* MIDDLE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COUNT CHART */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[420px]">
              <CountChart />
            </div>
            {/* ATTENDANCE CHART */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[420px]">
              <AttendanceChart />
            </div>
          </div>

          {/* BOTTOM CHART */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[450px]">
            <FinanceChart />
          </div>
        </div>

<<<<<<< HEAD
        {/* Announcements */}
        <Announcements />
=======
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* Session Info */}
          <SessionInfoCard />

          {/* Quick Stats - Alumni Overview */}
          <QuickStats />

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <EventCalendar />
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <Announcements />
          </div>
        </div>
>>>>>>> habyaad_dev
      </div>
    </div>
  );
};

export default AdminPage;
