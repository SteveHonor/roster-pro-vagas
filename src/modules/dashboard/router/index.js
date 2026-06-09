import Dashboard from "@/modules/dashboard/views/Index";
import UserDashboard from "@/modules/dashboard/views/UserDashboard";

export default [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: {
      layout: "default",
      requiresAuth: true,
      title: "DASHBOARD"
    },
  },
  {
    path: "/my-dashboard",
    name: "user-dashboard",
    component: UserDashboard,
    meta: {
      layout: "default",
      requiresAuth: true,
      title: "INÍCIO"
    },
  },
];
