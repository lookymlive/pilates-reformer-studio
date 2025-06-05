import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useRole } from '../../contexts/AuthContext';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  BookOpen,
  UserCheck,
  Clock,
  CreditCard,
  User,
  LogOut,
  Menu,
  Heart,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  // Admin Navigation
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['admin'],
  },
  {
    id: 'admin-users',
    label: 'Gestión de Usuarios',
    icon: Users,
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    id: 'admin-schedule',
    label: 'Gestión de Horarios',
    icon: Calendar,
    path: '/admin/schedule',
    roles: ['admin'],
  },
  {
    id: 'admin-reports',
    label: 'Reportes',
    icon: BarChart3,
    path: '/admin/reports',
    roles: ['admin'],
  },
  {
    id: 'admin-settings',
    label: 'Configuración',
    icon: Settings,
    path: '/admin/settings',
    roles: ['admin'],
  },

  // Instructor Navigation
  {
    id: 'instructor-dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['instructor'],
  },
  {
    id: 'instructor-classes',
    label: 'Mis Clases',
    icon: BookOpen,
    path: '/instructor/classes',
    roles: ['instructor'],
    badge: '5',
  },
  {
    id: 'instructor-students',
    label: 'Mis Alumnos',
    icon: UserCheck,
    path: '/instructor/students',
    roles: ['instructor'],
  },
  {
    id: 'instructor-schedule',
    label: 'Mi Horario',
    icon: Clock,
    path: '/instructor/schedule',
    roles: ['instructor'],
  },

  // Client Navigation
  {
    id: 'client-dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['cliente'],
  },
  {
    id: 'client-book',
    label: 'Reservar Clases',
    icon: Calendar,
    path: '/client/book',
    roles: ['cliente'],
  },
  {
    id: 'client-bookings',
    label: 'Mis Reservas',
    icon: BookOpen,
    path: '/client/bookings',
    roles: ['cliente'],
    badge: '3',
  },
  {
    id: 'client-profile',
    label: 'Mi Perfil',
    icon: User,
    path: '/client/profile',
    roles: ['cliente'],
  },
  {
    id: 'client-instructors',
    label: 'Instructores',
    icon: UserCheck,
    path: '/client/instructors',
    roles: ['cliente'],
  },
];

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { userRole } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administradora';
      case 'instructor': return 'Instructora';
      case 'cliente': return 'Cliente';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'cliente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-emerald-800 to-emerald-900 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Silvia Fernandez</h1>
                <p className="text-emerald-200 text-sm">Pilates Studio</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center px-4 mb-6">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-emerald-600 text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <Badge className={`text-xs ${getRoleBadgeColor(user.role)} border-0`}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left
                    ${isActive 
                      ? 'bg-emerald-700 text-white' 
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Studio Info */}
          <div className="p-4 border-t border-emerald-700">
            <div className="text-emerald-200 text-xs space-y-2">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span>Av. Santa Fe 3421, Palermo</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                <span>+54 11 4567-8900</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                <span>info@pilatesreformer.com</span>
              </div>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="w-full mt-4 text-emerald-200 hover:text-white hover:bg-emerald-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="bg-emerald-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-white font-bold">Pilates Studio</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-emerald-600 text-white text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <Badge className={`text-xs ${getRoleBadgeColor(user.role)} border-0 w-fit`}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        Navegación
                      </SheetTitle>
                      <SheetDescription>
                        Accede a todas las funciones de la aplicación
                      </SheetDescription>
                    </SheetHeader>
                    
                    <nav className="mt-6 space-y-1">
                      {filteredNavItems.map((item) => {
                        const isActive = currentPath === item.path;
                        const Icon = item.icon;
                        
                        return (
                          <Button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            variant={isActive ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge className="ml-2 bg-red-500 text-white text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
