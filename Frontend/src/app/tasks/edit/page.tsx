"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footer";

const TaskEditor = dynamic(() => import("@/components/tasks/TaskEditor"), {
  ssr: false,
});

function TaskEditContent() {
  const [theme, setTheme] = useState("light");
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");

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
        <TaskEditor theme={theme} taskId={taskId || undefined} />
      </main>
      <Footer theme={theme} />
    </div>
  );
}

export default function TaskEditPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <TaskEditContent />
    </Suspense>
  );
}
