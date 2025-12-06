"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footer";

const TaskEditor = dynamic(() => import("@/components/tasks/TaskEditor"), {
  ssr: false,
});

export default function TaskEditPage() {
  const [theme, setTheme] = useState("light");
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`app-container ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <TaskEditor theme={theme} taskId={params.taskId} />
      </main>
      <Footer theme={theme} />
    </div>
  );
}
