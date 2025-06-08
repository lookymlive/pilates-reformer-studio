import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  classService,
  classTypeService,
  equipmentService,
  userService,
} from "../../services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "instructor") return;
    const loadData = () => {
      const classes = classService.getByInstructor(user.id);
      setInstructorClasses(classes);

      const today = new Date().toISOString().split("T")[0];
      const todayClassesList = classes.filter((cls) => cls.date === today);
      setTodayClasses(todayClassesList);

      const upcomingClassesList = classes
        .filter((cls) => cls.date > today)
        .slice(0, 5);
      setUpcomingClasses(upcomingClassesList);

      const instructorInfo = userService.getById(user.id);
      setInstructor(instructorInfo);
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener("dataUpdate", handleDataUpdate);

    return () => {
      window.removeEventListener("dataUpdate", handleDataUpdate);
    };
  }, [user]);

  if (!user || user.role !== "instructor") {
    return <div>No tienes permisos para ver esta página</div>;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user.name}!
          </h1>
          <p className="text-gray-600">
            Resumen de tu actividad como instructora
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-xl font-bold">
              {instructor?.rating || 4.8}
            </span>
            <span className="text-gray-600">/ 5.0</span>
          </div>
          <p className="text-sm text-gray-600">
            {instructor?.totalClasses || 1250} clases impartidas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayClasses.length}</div>
              <p className="text-xs text-muted-foreground">
                Clases programadas para hoy
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas Clases
              </CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingClasses.length}</div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Activos
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">
                Estudiantes regulares
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valoración</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {instructor?.rating || 4.8}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio últimos 30 días
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Clases de Hoy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Clases de Hoy</CardTitle>
              <CardDescription>Tu agenda para el día de hoy</CardDescription>
            </CardHeader>
            <CardContent>
              {todayClasses.length > 0 ? (
                <div className="space-y-4">
                  {todayClasses.map((cls) => {
                    const classType = classTypeService.getById(cls.classTypeId);
                    const equipment = equipmentService.getById(cls.equipmentId);
                    const client =
                      cls.currentParticipants.length > 0
                        ? userService.getById(cls.currentParticipants[0])
                        : null;

                    return (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {classType?.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {cls.time}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{equipment?.name}</span>
                            </div>
                            {client && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                <span>{client.name}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{cls.duration} minutos</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge
                            className={
                              cls.status === "programada"
                                ? "bg-green-100 text-green-800"
                                : cls.status === "en_progreso"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {cls.status === "programada"
                              ? "Programada"
                              : cls.status === "en_progreso"
                              ? "En Progreso"
                              : "Completada"}
                          </Badge>
                          {client && (
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3 mr-1" />
                              Contactar
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No tienes clases programadas para hoy
                  </p>
                  <p className="text-sm text-gray-400">
                    ¡Disfruta tu día libre!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Perfil del Instructor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información profesional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {instructor?.experience || "5 años"} de experiencia
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">
                      {instructor?.rating || 4.8}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-1">
                  {(
                    instructor?.specialties || [
                      "Reformer Básico",
                      "Rehabilitación",
                    ]
                  ).map((specialty: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Certificaciones</h4>
                <div className="space-y-1">
                  {(
                    instructor?.certifications || [
                      "PMA Certified",
                      "Stott Pilates Level 3",
                    ]
                  ).map((cert: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximas Clases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Próximas Clases</CardTitle>
              <CardDescription>
                Clases programadas para esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-3">
                  {upcomingClasses.map((cls) => {
                    const classType = classTypeService.getById(cls.classTypeId);
                    const equipment = equipmentService.getById(cls.equipmentId);
                    const client =
                      cls.currentParticipants.length > 0
                        ? userService.getById(cls.currentParticipants[0])
                        : null;

                    return (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{classType?.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(cls.date).toLocaleDateString("es-ES", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>
                              {cls.time} • {equipment?.name}
                            </span>
                            {client && <span> • {client.name}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${cls.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cls.duration} min
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay clases programadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Rendimiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mi Rendimiento</CardTitle>
              <CardDescription>Métricas del último mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Puntualidad</span>
                  <span className="text-sm text-muted-foreground">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Satisfacción Clientes
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {instructor?.rating || 4.8}/5
                  </span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Asistencia Clientes
                  </span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Clases Este Mes
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">45</Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      Nuevos Alumnos
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">3</Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">Comentarios</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">12</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
