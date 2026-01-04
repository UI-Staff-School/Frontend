"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { showSuccess } from "@/lib/toast";
import { useUser } from "@/lib/hooks/useUser";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "coordinator", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "coordinator", "teacher"],
      },
      {
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "coordinator", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  // Get user role (lowercase for matching)
  const userRole = user?.role?.toLowerCase() || "";

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href + "/")) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        showSuccess("Logged out successfully");
        router.push("/sign-in");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-4">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 text-sm">
      {menuItems.map((section) => {
        // Filter items for this section based on user role
        const visibleItems = section.items.filter((item) =>
          item.visible.includes(userRole)
        );

        // Don't render section if no visible items
        if (visibleItems.length === 0) return null;

        return (
          <div className="mb-6" key={section.title}>
            <span className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </span>
            <div className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    href={item.href}
                    key={item.label + item.href}
                    className={`flex items-center justify-center lg:justify-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center ${active ? "brightness-0 invert" : ""}`}>
                      <Image src={item.icon} alt="" width={18} height={18} />
                    </div>
                    <span className="hidden lg:block font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Logout Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center lg:justify-start gap-3 py-2.5 px-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <Image src="/logout.png" alt="" width={18} height={18} />
          <span className="hidden lg:block font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Menu;
