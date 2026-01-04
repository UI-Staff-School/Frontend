import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* LEFT - Sidebar */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-white border-r border-gray-100 flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-100">
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Image
                src="/ui_logo.png"
                alt="UI Staff School"
                width={28}
                height={28}
                className="w-7 h-7"
              />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-gray-900 text-sm">UI Staff School</span>
              <p className="text-[10px] text-gray-400">Management Portal</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <Menu />
        </div>
      </div>

      {/* RIGHT - Main Content */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
