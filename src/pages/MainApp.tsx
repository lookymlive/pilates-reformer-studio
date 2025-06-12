import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { ClientDashboard } from "../components/dashboard/ClientDashboard";
import { InstructorDashboard } from "../components/dashboard/InstructorDashboard";
import { Navigation } from "../components/ui/Navigation";
import { useAuth, useRole } from "../contexts/AuthContext";

// Import functional components
import ConfigManagement from "../components/admin/ConfigManagement";
import { ScheduleManagement } from "../components/admin/ScheduleManagement";
import { UserManagement } from "../components/admin/UserManagement";
import { MyBookings } from "../components/booking/MyBookings";
import CalendarView from "../components/CalendarView";

// Placeholder components para las otras rutas
const Reports = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">
      Reportes y Estadísticas
    </h1>
    <p className="text-gray-600">Funcionalidad en desarrollo...</p>
  </div>
);

// Reemplaza el Settings placeholder por el componente real de configuración
const Settings = () => <ConfigManagement />;

const InstructorClasses = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mis Clases</h1>
    <p className="text-gray-600">Vista detallada de clases en desarrollo...</p>
  </div>
);

const InstructorStudents = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mis Alumnos</h1>
    <p className="text-gray-600">Lista de alumnos en desarrollo...</p>
  </div>
);

const InstructorSchedule = () => <CalendarView />;

const ClientProfile = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mi Perfil</h1>
    <p className="text-gray-600">Perfil del cliente en desarrollo...</p>
  </div>
);

const InstructorsList = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">
      Nuestros Instructores
    </h1>
    <p className="text-gray-600">Lista de instructores en desarrollo...</p>
  </div>
);

interface Route {
  path: string;
  component: React.ComponentType;
  roles: string[];
}

const routes: Route[] = [
  // Admin routes
  { path: "/dashboard", component: AdminDashboard, roles: ["admin"] },
  { path: "/admin/users", component: UserManagement, roles: ["admin"] },
  { path: "/admin/schedule", component: ScheduleManagement, roles: ["admin"] },
  { path: "/admin/reports", component: Reports, roles: ["admin"] },
  { path: "/admin/settings", component: Settings, roles: ["admin"] },

  // Instructor routes
  { path: "/dashboard", component: InstructorDashboard, roles: ["instructor"] },
  {
    path: "/instructor/classes",
    component: InstructorClasses,
    roles: ["instructor"],
  },
  {
    path: "/instructor/students",
    component: InstructorStudents,
    roles: ["instructor"],
  },
  {
    path: "/instructor/schedule",
    component: InstructorSchedule,
    roles: ["instructor"],
  },

  // Client routes
  { path: "/dashboard", component: ClientDashboard, roles: ["cliente"] },
  { path: "/client/book", component: CalendarView, roles: ["cliente"] },
  { path: "/client/bookings", component: MyBookings, roles: ["cliente"] },
  { path: "/client/profile", component: ClientProfile, roles: ["cliente"] },
  {
    path: "/client/instructors",
    component: InstructorsList,
    roles: ["cliente"],
  },
];

export const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { userRole } = useRole();
  const [currentPath, setCurrentPath] = useState("/dashboard");

  // Si no está autenticado, las rutas protegidas manejarán el redirect al login
  if (!isAuthenticated) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  // Filtrar rutas según el rol del usuario
  const userRoutes = routes.filter((route) =>
    route.roles.includes(userRole || "")
  );

  // Encontrar la ruta actual
  const currentRoute = userRoutes.find((route) => route.path === currentPath);
  const CurrentComponent =
    currentRoute?.component ||
    (() => (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>
        <p className="text-gray-600">
          La página que buscas no existe o no tienes permisos para acceder.
        </p>
      </div>
    ));

  const handleNavigation = (path: string) => {
    setCurrentPath(path);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath={currentPath} onNavigate={handleNavigation} />

      {/* Main Content */}
      <div className="md:pl-64">
        <div className="md:pt-0 pt-16">
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="min-h-screen"
              >
                <ProtectedRoute allowedRoles={currentRoute?.roles || []}>
                  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <CurrentComponent />
                  </div>
                </ProtectedRoute>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};
