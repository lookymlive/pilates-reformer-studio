import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Activity,
} from 'lucide-react';
import { analyticsService } from '../../services/dataService';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(analyticsService.getDashboardStats());
  const [weeklyRevenueData, setWeeklyRevenueData] = useState(analyticsService.getRevenueData(7));
  const [classTypeData, setClassTypeData] = useState(analyticsService.getClassTypeDistribution());

  useEffect(() => {
    // Update data on component mount and listen for data changes
    const updateData = () => {
      setStats(analyticsService.getDashboardStats());
      setWeeklyRevenueData(analyticsService.getRevenueData(7));
      setClassTypeData(analyticsService.getClassTypeDistribution());
    };

    updateData();

    // Listen for data updates
    const handleDataUpdate = () => updateData();
    window.addEventListener('dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

  const occupancyData = [
    { time: '07:00', ocupacion: 95 },
    { time: '09:00', ocupacion: 100 },
    { time: '11:00', ocupacion: 85 },
    { time: '13:00', ocupacion: 70 },
    { time: '15:00', ocupacion: 90 },
    { time: '17:00', ocupacion: 100 },
    { time: '19:00', ocupacion: 80 },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
  }> = ({ title, value, description, icon: Icon, color, trend }) => (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Resumen completo del estudio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Programar Clase
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Clientes"
          value={stats.totalClients.toString()}
          description="Clientes activos registrados"
          icon={Users}
          color="text-blue-600"
          trend="+12% vs mes anterior"
        />
        <StatCard
          title="Ingresos Mensuales"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          description="Facturación del mes actual"
          icon={DollarSign}
          color="text-green-600"
          trend="+8% vs mes anterior"
        />
        <StatCard
          title="Clases esta Semana"
          value={stats.classesThisWeek.toString()}
          description="Clases programadas y completadas"
          icon={Calendar}
          color="text-purple-600"
        />
        <StatCard
          title="Tasa de Ocupación"
          value={`${stats.occupancyRate}%`}
          description="Promedio de ocupación semanal"
          icon={TrendingUp}
          color="text-emerald-600"
          trend="+3.2% vs semana anterior"
        />
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Ingresos Semanales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Semanales</CardTitle>
              <CardDescription>
                Facturación diaria de la semana actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Distribución de Tipos de Clase */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Clase</CardTitle>
              <CardDescription>
                Distribución por tipo de clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={classTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {classTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {classTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ocupación por Horario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Ocupación por Horario</CardTitle>
              <CardDescription>
                Porcentaje de ocupación durante el día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Ocupación']} />
                  <Line 
                    type="monotone" 
                    dataKey="ocupacion" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>KPIs del Mes</CardTitle>
              <CardDescription>
                Indicadores clave de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Retención de Clientes</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Satisfacción Promedio</span>
                  <span className="text-sm text-muted-foreground">4.8/5</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4.8 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Puntualidad</span>
                  <span className="text-sm text-muted-foreground">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Cancelaciones</span>
                  <span className="text-sm text-muted-foreground">4.5%</span>
                </div>
                <Progress value={4.5} className="h-2" />
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">Objetivos Cumplidos</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">8/10</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">En Progreso</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">Requiere Atención</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actividad Reciente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  time: 'Hace 5 min',
                  action: 'Nueva reserva realizada',
                  user: 'Carmen Rodriguez',
                  details: 'Reformer Básico - 09:00',
                  type: 'booking'
                },
                {
                  time: 'Hace 15 min',
                  action: 'Cliente canceló clase',
                  user: 'Laura Martínez',
                  details: 'Reformer Intermedio - 14:00',
                  type: 'cancellation'
                },
                {
                  time: 'Hace 1 hora',
                  action: 'Nuevo cliente registrado',
                  user: 'Sofia Vargas',
                  details: 'Membresía: Por clase',
                  type: 'registration'
                },
                {
                  time: 'Hace 2 horas',
                  action: 'Clase completada',
                  user: 'María González',
                  details: 'Reformer Básico - 11:00',
                  type: 'completed'
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'cancellation' ? 'bg-red-500' :
                    activity.type === 'registration' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user} - {activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
