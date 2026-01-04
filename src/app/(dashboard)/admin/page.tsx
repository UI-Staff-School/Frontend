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

      </div>
    </div>
  );
};

export default AdminPage;
