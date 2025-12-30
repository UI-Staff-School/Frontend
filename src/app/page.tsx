import Link from "next/link";
import { paths } from "@/lib/paths";

const Homepage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs tracking-wider uppercase text-indigo-600 font-semibold">
              Student Information Management System
            </span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Manage students, classes, results and attendance effortlessly
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-prose">
              A modern dashboard to streamline academic workflows for admins,
              teachers, students and parents.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={paths.auth.signIn}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-xl p-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 p-4">
                <p className="text-sm font-semibold text-gray-700">Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">24k+</p>
                <p className="text-xs text-gray-500 mt-1">Active records</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-purple-100 to-white border border-purple-100 p-4">
                <p className="text-sm font-semibold text-gray-700">Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1.2k</p>
                <p className="text-xs text-gray-500 mt-1">Managed</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-white border border-emerald-100 p-4">
                <p className="text-sm font-semibold text-gray-700">Results</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
                <p className="text-xs text-gray-500 mt-1">Avg. pass rate</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-amber-100 to-white border border-amber-100 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  Attendance
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">96%</p>
                <p className="text-xs text-gray-500 mt-1">On-time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white/80 backdrop-blur-xl border border-indigo-100 p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Centralized Records
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Store and manage student information, guardians, and academic
              histories in one place.
            </p>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur-xl border border-purple-100 p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Assessment & Results
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Record assessments, compute results, and share progress with
              stakeholders.
            </p>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur-xl border border-emerald-100 p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Tracking
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Monitor daily attendance and visualize trends for early
              interventions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Homepage;
