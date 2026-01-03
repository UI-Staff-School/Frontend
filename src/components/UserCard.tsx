"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface UserCardProps {
  type: "student" | "teacher" | "parent" | "staff" | "alumni";
}

interface Analytics {
  counts: {
    students: number;
    teachers: number;
    parents: number;
    staff: number;
    alumni: number;
  };
  activeSession?: {
    name: string;
  } | null;
}

const UserCard = ({ type }: UserCardProps) => {
  const [count, setCount] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState<string>("2024/25");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data: Analytics = await res.json();

        // Set count based on type
        switch (type) {
          case "student":
            setCount(data.counts.students);
            break;
          case "teacher":
            setCount(data.counts.teachers);
            break;
          case "parent":
            setCount(data.counts.parents);
            break;
          case "staff":
            setCount(data.counts.staff);
            break;
          case "alumni":
            setCount(data.counts.alumni);
            break;
        }

        // Set session name
        if (data.activeSession?.name) {
          setSessionName(data.activeSession.name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "student":
        return "/student.png";
      case "teacher":
        return "/teacher.png";
      case "parent":
        return "/parent.png";
      case "staff":
        return "/staff.png";
      case "alumni":
        return "/student.png";
      default:
        return "/profile.png";
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "student":
        return "bg-lamaSky";
      case "teacher":
        return "bg-lamaYellow";
      case "parent":
        return "bg-lamaPurple";
      case "staff":
        return "bg-lamaPurpleLight";
      case "alumni":
        return "bg-green-100";
      default:
        return "bg-lamaSky";
    }
  };

  return (
    <div className={`rounded-2xl ${getBgColor()} p-4 flex-1 min-w-[130px]`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          {sessionName}
        </span>
        <Image src={getIcon()} alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">
        {loading ? (
          <span className="inline-block w-16 h-8 bg-white/30 animate-pulse rounded"></span>
        ) : (
          count?.toLocaleString() ?? "-"
        )}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
