import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthUser } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType extends AuthUser {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('pilates_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('pilates_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular autenticación con los datos mock
      const foundUser = mockUsers.find(user => user.email === email);
      
      if (foundUser && foundUser.isActive) {
        // En una aplicación real, aquí verificaríamos la contraseña
        // Por ahora, aceptamos cualquier contraseña para demostración
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('pilates_user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pilates_user');
  };

  const register = async (userData: Omit<User, 'id' | 'joinDate' | 'isActive'>): Promise<boolean> => {
    try {
      // Verificar si el email ya existe
      const existingUser = mockUsers.find(user => user.email === userData.email);
      if (existingUser) {
        return false; // Email ya existe
      }

      // Crear nuevo usuario
      const newUser: User = {
        ...userData,
        id: Date.now().toString(), // Generar ID simple para demo
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      // En una aplicación real, aquí enviaríamos los datos al servidor
      // Para demo, agregamos al array mock (solo en memoria)
      mockUsers.push(newUser);
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('pilates_user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de conveniencia para verificar roles
export const useRole = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const isClient = user?.role === 'cliente';
  
  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return {
    isAdmin,
    isInstructor,
    isClient,
    hasPermission,
    userRole: user?.role,
  };
};
