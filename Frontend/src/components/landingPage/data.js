"use client";

// Images now in public folder
const feature1 = "/organize.jpg";
const feature2 = "/reminder3.jpeg";
const feature3 = "/switch.jpg";
const feature4 = "/priority.jpg";
const feature0 = "/ai.jpg";

export const featuresData = [
  {
    title: "AI-Powered Task Assistant",
    description:
      "Experience the future of task management with our intelligent AI assistant. Simply chat naturally about your tasks, and our AI will understand your intent, create tasks with appropriate deadlines, update existing tasks, or delete completed ones—all through conversational interactions.",
    image: feature0,
    icon: "bi bi-robot",
    demoType: "ai-chat",
    highlights: [
      "Natural language processing",
      "Quick task generation",
      "Conversational updates",
      "Smart deadline suggestions"
    ]
  },
  {
    title: "Organize Your Tasks",
    description:
      "Create, manage, and prioritize your tasks effortlessly with drag-and-drop functionality. Our intuitive interface makes task organization a breeze, helping you focus on what matters most.",
    image: feature1,
    icon: "bi bi-list-check",
    demoType: "task-list",
    alt: "Organize Your Tasks",
  },
  {
    title: "Smart Reminders",
    description:
      "Never miss a deadline with customizable reminders and notifications. Set multiple reminders per task with flexible timing options—from minutes to days before your deadline. Stay on track with smart alerts that help you manage your time effectively.",
    image: feature2,
    icon: "bi bi-bell",
    demoType: "reminders",
    alt: "Set Reminders",
  },
  {
    title: "Dark and Light Modes",
    description:
      "Customize your viewing experience with both dark and light modes. Our seamless theme switching makes it easy on your eyes no matter the time of day or your personal preferences.",
    image: feature3,
    icon: "bi bi-moon-stars",
    demoType: "theme",
    alt: "Dark and Light Modes",
  },
  {
    title: "Task Prioritization",
    description:
      "Easily prioritize your tasks with our drag-and-drop interface. Reorder tasks instantly to adjust priorities on the fly and focus on what's most important.",
    image: feature4,
    icon: "bi bi-arrows-move",
    demoType: "priority",
    alt: "Task Prioritization",
  },
];

export const benefitsData = [
  {
    icon: "bi bi-robot",
    title: "AI-Powered Intelligence",
    description:
      "Leverage cutting-edge AI technology to manage tasks through natural conversation. Our intelligent assistant understands context and creates tasks the way you think.",
  },
  {
    icon: "bi bi-speedometer2",
    title: "Fast & Reliable",
    description:
      "Experience lightning-fast performance and reliable task management tools that keep you productive.",
  },
  {
    icon: "bi bi-shield-lock",
    title: "Secure",
    description:
      "Your data is protected with enterprise-grade security measures and encryption protocols.",
  },
  {
    icon: "bi bi-phone",
    title: "Mobile Friendly",
    description:
      "Access your tasks anywhere, anytime with our responsive WhatsApp-like mobile interface.",
  },
  {
    icon: "bi bi-envelope",
    title: "Email Notifications",
    description:
      "Stay informed with email notifications about task updates, deadlines, and reminders directly in your inbox.",
  },
  {
    icon: "bi bi-person",
    title: "Profile Customization",
    description:
      "Customize your profile settings, manage account details, and personalize your task management experience.",
  },
  {
    icon: "bi bi-list-check",
    title: "Task Prioritization",
    description:
      "Easily prioritize your tasks with our intuitive drag-and-drop interface. Arrange your tasks by priority to ensure you're always focusing on what matters most.",
  },
  {
    icon: "bi bi-chat-dots",
    title: "Conversational Updates",
    description:
      "Update, modify, or delete tasks through natural conversation. Our AI remembers context and handles complex task management scenarios effortlessly.",
  },
];

export const testimonialsData = [
  {
    quote:
      "The AI assistant is a game-changer! I can just tell it what I need to do, and it creates perfectly structured tasks with reminders. It's like having a personal productivity coach.",
    author: "Sarah Chen",
    role: "Product Manager"
  },
  {
    quote:
      "I've tried many task managers, but this one truly stands out with its conversational AI. Managing tasks feels natural now—no more clicking through endless menus!",
    author: "Michael Torres",
    role: "Freelance Designer"
  },
  {
    quote:
      "The reminders feature combined with AI suggestions is fantastic! It ensures I never miss important deadlines and keeps my day perfectly organized.",
    author: "Emily Rodriguez",
    role: "Marketing Director"
  },
  {
    quote:
      "The WhatsApp-like AI interface makes task management feel effortless. I can update tasks on the go with just a quick message. Absolutely brilliant!",
    author: "David Kim",
    role: "Software Engineer"
  },
];

// Demo conversation data
export const demoConversation = [
  {
    role: "user",
    content: "I need to prepare for a client meeting next Tuesday at 2 PM",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    role: "assistant",
    content: "I'll create a task for your client meeting preparation. Would you like me to add reminders?",
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    role: "user",
    content: "Yes, remind me 1 day before and 1 hour before",
    timestamp: new Date(Date.now() - 3400000).toISOString()
  },
  {
    role: "assistant",
    content: "Perfect! I've created the task 'Prepare for client meeting' with deadline Tuesday 2:00 PM and reminders set for 1 day and 1 hour before. ✅",
    timestamp: new Date(Date.now() - 3300000).toISOString()
  }
];

// demo data (data.js)
export const demoTasks = [
  {
    id: 1,
    title: "Prepare for client meeting",
    description: "Review presentation slides and prepare talking points",
    status: "not-started",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // added
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    reminders: [
      { time: 1440, unit: "minutes" },
      { time: 60, unit: "minutes" }
    ]
  },
  {
    id: 2,
    title: "Submit quarterly report",
    description: "Finalize Q4 financial report and submit to management",
    status: "in-progress",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // added
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    reminders: [{ time: 1, unit: "days" }]
  },
  {
    id: 3,
    title: "Team standup meeting",
    description: "Daily sync with development team",
    status: "not-started",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // added
    deadline: new Date(Date.now() + 86400000).toISOString(),
    reminders: [{ time: 30, unit: "minutes" }]
  }
];
