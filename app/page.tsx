"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Plus, Trash2, FileText, Download } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Actualizar la interfaz IntensifySubject para incluir el año/sección donde intensificará
interface IntensifySubject {
  id: string
  pendingSubject: string
  pendingYear: string
  model: "1" | "2"
  intensifyInYear: string
  intensifyIn: string
  yearSection: string
  daysSchedule: string
  shift: string
}

interface RecourseSubject {
  id: string
  subjectName: string
  year: string
  yearSection: string
  daysSchedule: string
  shift: string
}

interface FormData {
  studentName: string
  studentDNI: string  // Agregar este campo
  courseSection: string
  shift: string
  date: Date | undefined
  edteMembers: string[]
  intensifySubjects: IntensifySubject[]
  recourseSubjects: RecourseSubject[]
  cannotTakeSubjects: string
}

// Definición de cursos y secciones
const COURSES = [
  "1° 1°", "1° 2°", "1° 3°", "1° 4°", "1° 5°", "1° 6°",
  "2° 1°", "2° 2°", "2° 3°", "2° 4°", "2° 5°", "2° 6°",
  "3° 1°", "3° 2°", "3° 3°", "3° 4°", "3° 5°", "3° 6°",
  "4° 1°", "4° 2°", "4° 3°", "4° 4°", "4° 5°",
  "5° 1°", "5° 2°", "5° 3°", "5° 6°", "5° 7°",
  "6° 1°", "6° 2°", "6° 3°", "6° 5°", "6° 6°", "6° 7°",
  "7° 1°", "7° 2°", "7° 3°", "7° 6°", "7° 7°"
]

// Corregir las materias por año y especialidad, especialmente 7° año
const SUBJECTS = {
  "1°": [
    "Ciencias Naturales", "Ciencias Sociales", "Educación Artística", "Educación Física",
    "Inglés", "Matemática", "Prácticas de Lenguaje", "Construcción Ciudadana",
    "Procedimientos Técnicos I", "Lenguajes Tecnológicos I", "Sistemas Tecnológicos I"
  ],
  "2°": [
    "Biología", "C. de Ciudadanía", "Educación Artística", "Educación Física",
    "Físico Química", "Geografía", "Historia", "Inglés", "Matemática",
    "Prácticas del Lenguaje", "Procedimientos Técnicos II", "Lenguajes Tecnológicos II",
    "Sistemas Tecnológicos II"
  ],
  "3°": [
    "Biología", "C. de Ciudadanía", "Educación Artística", "Educación Física",
    "Físico Química", "Geografía", "Historia", "Inglés", "Matemática",
    "Prácticas del Lenguaje", "Procedimientos Técnicos III", "Lenguajes Tecnológicos III",
    "Sistemas Tecnológicos III"
  ],
  "4° Alimentos": [
    "Literatura", "Inglés", "Educación Física", "Salud y Adolescencia", "Historia", "Geografía",
    "Matemática Ciclo Superior", "Química", "Física", "Operaciones Unitarias",
    "Int. Biología Celular", "Laboratorio de Operaciones Unitarias",
    "Laboratorio de Ensayos Físicos", "Laboratorio de Química"
  ],
  "4° Electromecánica": [
    "Literatura", "Inglés", "Educación Física", "Salud y Adolescencia", "Historia", "Geografía",
    "Matemática Ciclo Superior", "Física", "Química", "Conocimiento de los Materiales",
    "Dibujo Tecnológico", "Máquinas Eléctricas y Automatismos",
    "Diseño y Procesamiento Mecánico", "Instalaciones y Aplicaciones de la Energía"
  ],
  "4° MMO": [
    "Literatura", "Inglés", "Educación Física", "Salud y Adolescencia", "Historia", "Geografía",
    "Matemática Ciclo Superior", "Física", "Química", "Conocimiento de los Materiales",
    "Dibujo Tecnológico", "Interpretación de Anteproyectos", "Planificación de Obra",
    "Sistemas Constructivos", "Proyecto"
  ],
  "5° Alimentos": [
    "Literatura", "Inglés", "Educación Física", "Política y Ciudadanía", "Historia", "Geografía",
    "Análisis Matemático", "Química Orgánica", "Química General e Inorgánica",
    "Procesos Químicos y Control", "Laboratorio de Procesos Industriales",
    "Laboratorio de Técnicas Analíticas", "Laboratorio de Química Orgánica"
  ],
  "5° Electromecánica": [
    "Literatura", "Inglés", "Educación Física", "Política y Ciudadanía", "Historia", "Geografía",
    "Análisis Matemático", "Mecánica y Mecanismos", "Electrotecnia",
    "Resistencia y Ensayos de los Materiales", "Máquinas Eléctricas y Automatismos",
    "Diseño y Procesamiento Mecánico", "Instalaciones y Aplicaciones de la Energía"
  ],
  "5° MMO": [
    "Literatura", "Inglés", "Educación Física", "Política y Ciudadanía", "Historia", "Geografía",
    "Análisis Matemático", "Instalaciones Eléctricas", "Resistencia y Ensayos de los Materiales",
    "Documentación Técnica", "Materiales de Obra", "Sistemas Constructivos", "Proyecto"
  ],
  "6° Alimentos": [
    "Literatura", "Inglés", "Educación Física", "Filosofía", "Arte", "Matemática Aplicada",
    "Química Orgánica y Biológica", "Química Industrial", "Química Analítica",
    "Derechos del Trabajo", "Laboratorio de Química Orgánica, Biológica y Microbiológica",
    "Laboratorio de Técnicas Analíticas", "Laboratorio de Procesos Industriales"
  ],
  "6° Electromecánica": [
    "Literatura", "Inglés", "Filosofía", "Educación Física", "Arte", "Matemática Aplicada",
    "Termodinámica y M.T.", "Electrotecnia", "Sistemas Mecánicos", "Derechos del Trabajo",
    "Laboratorio de Mediciones Eléctricas", "Máquinas Eléctricas y Automatismos",
    "Diseño y Procesamiento Mecánico", "Instalaciones y Aplicaciones de la Energía"
  ],
  "6° MMO": [
    "Literatura", "Inglés", "Educación Física", "Filosofía", "Arte", "Matemática Aplicada",
    "Instalaciones Sanitarias y de Gas", "Estructuras", "Derechos del Trabajo",
    "Proyectos de Instalaciones", "Dirección de la Ejecución de Instalaciones",
    "Sistemas Constructivos", "Proyecto"
  ],
  "7° Alimentos": [
    "Prácticas Prof. del S.I y D.P", "Emprend. Prod. y D. Local", "Bromatología y Nutrición",
    "Gestión de la Calidad y Leg.", "Org. y Gestión Industrial", "Microbiología de los Alimentos",
    "Laboratorio de Bromatología", "Laboratorio de Procesos Ind."
  ],
  "7° Electromecánica": [
    "P. PROFESIONALIZANTES",
    "EMPRENDIMIENTOS PRODUCTIVOS Y DESARROLLO LOCAL",
    "ELECTRÓNICA INDUSTRIAL",
    "SEGURIDAD HIGIENE Y PROTECCIÓN AMBIENTAL",
    "MÁQUINAS ELÉCTRICAS",
    "SISTEMAS MECÁNICOS",
    "LAB. DE METROLOGÍA Y CONTROL DE CALIDAD",
    "MANTENIMIENTO Y MONTAJE ELECTROMECÁNICO",
    "PROYECTO Y DISEÑO ELECTROMECÁNICO",
    "PROYECTO Y DISEÑO DE INST. ELÉCTRICAS"
  ],
  "7° MMO": [
    "Prácticas Prof.", "Emprend. Produ. y D. L", "Inst. de Acond. del Aire", "Estructuras",
    "Proyecto Final", "Dirección de Obra", "Ejercicio P. de la Construcción"
  ]
}

// Función para determinar la especialidad basada en el curso
const getSpecialty = (course: string): string => {
  const [year, section] = course.split(" ")
  
  if (["1°", "2°", "3°"].includes(year)) return "General"
  
  if (year === "4°") {
    if (section === "5°") return "Alimentos"
    if (["1°", "2°"].includes(section)) return "Electromecánica"
    if (["3°", "4°"].includes(section)) return "MMO"
  }
  
  if (year === "5°") {
    if (section === "3°") return "Alimentos"
    if (["1°", "7°"].includes(section)) return "Electromecánica"
    if (["2°", "6°"].includes(section)) return "MMO"
  }
  
  if (year === "6°") {
    if (section === "3°") return "Alimentos"
    if (["1°", "7°"].includes(section)) return "Electromecánica"
    if (["2°", "6°"].includes(section)) return "MMO"
  }
  
  if (year === "7°") {
    if (section === "3°") return "Alimentos"
    if (["1°", "7°"].includes(section)) return "Electromecánica"
    if (["2°", "6°"].includes(section)) return "MMO"
  }
  
  return "General"
}

// Función para obtener los años anteriores disponibles
const getAvailableYears = (currentCourse: string): string[] => {
  const [currentYear] = currentCourse.split(" ")
  const currentYearNum = parseInt(currentYear.replace("°", ""))
  const specialty = getSpecialty(currentCourse)
  
  const years: string[] = []
  
  for (let i = 1; i < currentYearNum; i++) {
    if (i <= 3) {
      years.push(`${i}°`)
    } else {
      years.push(`${i}° ${specialty}`)
    }
  }
  
  return years
}

// Reemplazar la función getAvailableYearsForIntensify con esta nueva lógica:

// Función para obtener los años disponibles para intensificar según el modelo
const getAvailableYearsForIntensify = (currentCourse: string, model: "1" | "2"): string[] => {
  const [currentYear] = currentCourse.split(" ")
  const currentYearNum = parseInt(currentYear.replace("°", ""))
  const specialty = getSpecialty(currentCourse)
  
  const years: string[] = []
  
  if (model === "1") {
    // Modelo 1: Solo el año que está cursando
    if (currentYearNum <= 3) {
      years.push(`${currentYearNum}°`)
    } else {
      years.push(`${currentYearNum}° ${specialty}`)
    }
  } else {
    // Modelo 2: Todos los años anteriores al que está cursando
    for (let i = 1; i < currentYearNum; i++) {
      if (i <= 3) {
        years.push(`${i}°`)
      } else {
        years.push(`${i}° ${specialty}`)
      }
    }
  }
  
  return years
}

// Función para obtener las materias de un año específico
const getSubjectsForYear = (year: string): string[] => {
  return SUBJECTS[year as keyof typeof SUBJECTS] || []
}

// Función para obtener las secciones disponibles para un año específico
const getAvailableSections = (year: string): string[] => {
  const yearNum = parseInt(year.replace("°", "").split(" ")[0])
  
  if (yearNum <= 3) {
    return ["1°", "2°", "3°", "4°", "5°", "6°"]
  } else if (yearNum === 4) {
    if (year.includes("Alimentos")) return ["5°"]
    if (year.includes("Electromecánica")) return ["1°", "2°"]
    if (year.includes("MMO")) return ["3°", "4°"]
  } else if (yearNum === 5) {
    if (year.includes("Alimentos")) return ["3°"]
    if (year.includes("Electromecánica")) return ["1°", "7°"]
    if (year.includes("MMO")) return ["2°", "6°"]
  } else if (yearNum === 6) {
    if (year.includes("Alimentos")) return ["3°"]
    if (year.includes("Electromecánica")) return ["1°", "7°"]
    if (year.includes("MMO")) return ["2°", "6°"]
  } else if (yearNum === 7) {
    if (year.includes("Alimentos")) return ["3°"]
    if (year.includes("Electromecánica")) return ["1°", "7°"]
    if (year.includes("MMO")) return ["2°", "6°"]
  }
  
  return ["1°"]
}

export default function StudentDocumentGenerator() {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    studentDNI: "",  // Agregar este campo
    courseSection: "",
    shift: "",
    date: undefined,
    edteMembers: [""],
    // En el estado inicial de formData, actualizar intensifySubjects:
    intensifySubjects: [{
      id: "1",
      pendingSubject: "",
      pendingYear: "",
      model: "1",
      intensifyInYear: "",
      intensifyIn: "",
      yearSection: "",
      daysSchedule: "",
      shift: ""
    }],
    recourseSubjects: [{
      id: "1",
      subjectName: "",
      year: "",
      yearSection: "",
      daysSchedule: "",
      shift: ""
    }],
    cannotTakeSubjects: ""
  })

  const [availableYears, setAvailableYears] = useState<string[]>([])

  useEffect(() => {
    if (formData.courseSection) {
      setAvailableYears(getAvailableYears(formData.courseSection))
    }
  }, [formData.courseSection])

  // También agregar un useEffect para limpiar el año de intensificación cuando cambie el modelo:

  useEffect(() => {
    // Limpiar años de intensificación cuando cambie el modelo
    setFormData(prev => ({
      ...prev,
      intensifySubjects: prev.intensifySubjects.map(subject => ({
        ...subject,
        intensifyInYear: "",
        intensifyIn: ""
      }))
    }))
  }, [formData.courseSection])

  const addEdteMember = () => {
    setFormData(prev => ({
      ...prev,
      edteMembers: [...prev.edteMembers, ""]
    }))
  }

  const removeEdteMember = (index: number) => {
    if (formData.edteMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        edteMembers: prev.edteMembers.filter((_, i) => i !== index)
      }))
    }
  }

  const updateEdteMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      edteMembers: prev.edteMembers.map((member, i) => i === index ? value : member)
    }))
  }

  // En la función addIntensifySubject, actualizar el objeto inicial:
  const addIntensifySubject = () => {
    const newId = (formData.intensifySubjects.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      intensifySubjects: [...prev.intensifySubjects, {
        id: newId,
        pendingSubject: "",
        pendingYear: "",
        model: "1",
        intensifyInYear: "",
        intensifyIn: "",
        yearSection: "",
        daysSchedule: "",
        shift: ""
      }]
    }))
  }

  const removeIntensifySubject = (id: string) => {
    if (formData.intensifySubjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        intensifySubjects: prev.intensifySubjects.filter(subject => subject.id !== id)
      }))
    }
  }

  const updateIntensifySubject = (id: string, field: keyof IntensifySubject, value: string) => {
    setFormData(prev => ({
      ...prev,
      intensifySubjects: prev.intensifySubjects.map(subject =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    }))
  }

  const addRecourseSubject = () => {
    const newId = (formData.recourseSubjects.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      recourseSubjects: [...prev.recourseSubjects, {
        id: newId,
        subjectName: "",
        year: "",
        yearSection: "",
        daysSchedule: "",
        shift: ""
      }]
    }))
  }

  const removeRecourseSubject = (id: string) => {
    if (formData.recourseSubjects.length > 1) {
      setFormData(prev => ({
        ...prev,
        recourseSubjects: prev.recourseSubjects.filter(subject => subject.id !== id)
      }))
    }
  }

  const updateRecourseSubject = (id: string, field: keyof RecourseSubject, value: string) => {
    setFormData(prev => ({
      ...prev,
      recourseSubjects: prev.recourseSubjects.map(subject =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    }))
  }

  const generateNotification = async () => {
    try {
      const response = await fetch('/api/generate-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.studentName}_Notificacion.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating notification:', error)
    }
  }

  const generateActa = async () => {
    try {
      const response = await fetch('/api/generate-acta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.studentName}_Acta.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating acta:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8 border-2 border-green-200 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Image
                src="/logo.png"
                alt="E.E.S.T. N° 6 Logo"
                width={80}
                height={80}
                className="bg-white p-2 rounded-lg"
              />
              <div>
                <CardTitle className="text-2xl font-bold">
                  E.E.S.T. N° 6 "Ing. Juan V. Passalacqua"
                </CardTitle>
                <p className="text-green-100 text-lg">
                  Banfield - Lomas de Zamora
                </p>
              </div>
            </div>
            <p className="text-green-100">
              Sistema EDTE - Generador de Documentos para Estudiantes con Materias Pendientes
            </p>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {/* Datos del Estudiante */}
          <Card className="border-2 border-green-200 shadow-md">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Datos del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName" className="text-green-700 font-medium">Nombre del Estudiante</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Ej: Castro Víctor Matías"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="studentDNI" className="text-green-700 font-medium">DNI del Estudiante</Label>
                  <Input
                    id="studentDNI"
                    value={formData.studentDNI}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentDNI: e.target.value }))}
                    placeholder="Ej: 49067558"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="courseSection" className="text-green-700 font-medium">Curso y Sección</Label>
                  <Select 
                    value={formData.courseSection} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, courseSection: value }))}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar curso y sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift" className="text-green-700 font-medium">Turno</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}>
                    <SelectTrigger className="border-green-200 focus:border-green-500">
                      <SelectValue placeholder="Seleccionar turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mañana">Mañana</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Vespertino">Vespertino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-green-700 font-medium">Fecha</Label>
                  <Input
                    type="date"
                    value={formData.date ? format(formData.date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value
                      setFormData(prev => ({ 
                        ...prev, 
                        date: dateValue ? new Date(dateValue) : undefined 
                      }))
                    }}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrantes del EDTE */}
          <Card className="border-2 border-green-200 shadow-md">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Integrantes del EDTE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {formData.edteMembers.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => updateEdteMember(index, e.target.value)}
                    placeholder={`Integrante ${index + 1}`}
                    className="border-green-200 focus:border-green-500"
                  />
                  {formData.edteMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEdteMember(index)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={addEdteMember} 
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Integrante
              </Button>
            </CardContent>
          </Card>

          {/* Materias a Intensificar */}
          <Card className="border-2 border-yellow-200 shadow-md">
            <CardHeader className="bg-yellow-100">
              <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                Materias a INTENSIFICAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {formData.intensifySubjects.map((subject, index) => (
                <div key={subject.id} className="border-2 border-yellow-200 rounded-lg p-4 space-y-4 bg-yellow-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-yellow-800">Materia {index + 1}</h4>
                    {formData.intensifySubjects.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIntensifySubject(subject.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-yellow-700 font-medium">Año de la materia pendiente</Label>
                      <Select
                        value={subject.pendingYear}
                        onValueChange={(value) => {
                          updateIntensifySubject(subject.id, 'pendingYear', value)
                          updateIntensifySubject(subject.id, 'pendingSubject', '') // Reset subject when year changes
                        }}
                      >
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-yellow-700 font-medium">Materia pendiente de aprobación</Label>
                      <Select
                        value={subject.pendingSubject}
                        onValueChange={(value) => updateIntensifySubject(subject.id, 'pendingSubject', value)}
                        disabled={!subject.pendingYear}
                      >
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                          <SelectValue placeholder="Seleccionar materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {subject.pendingYear && getSubjectsForYear(subject.pendingYear).map(subjectName => (
                            <SelectItem key={subjectName} value={subjectName}>{subjectName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-yellow-700 font-medium">Modelo</Label>
                      <Select
                        value={subject.model}
                        onValueChange={(value: "1" | "2") => updateIntensifySubject(subject.id, 'model', value)}
                      >
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Modelo 1</SelectItem>
                          <SelectItem value="2">Modelo 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* En la sección de materias a intensificar, reemplazar el campo "Materia en que intensificará" con: */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-yellow-700 font-medium">Año donde intensificará</Label>
                        <Select
                          value={subject.intensifyInYear}
                          onValueChange={(value) => {
                            updateIntensifySubject(subject.id, 'intensifyInYear', value)
                            updateIntensifySubject(subject.id, 'intensifyIn', '') // Reset subject when year changes
                          }}
                          disabled={!subject.model} // Deshabilitar hasta que se seleccione el modelo
                        >
                          <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                            <SelectValue placeholder="Seleccionar año" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.courseSection && subject.model && getAvailableYearsForIntensify(formData.courseSection, subject.model).map(year => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-yellow-700 font-medium">Materia en que intensificará</Label>
                        <Select
                          value={subject.intensifyIn}
                          onValueChange={(value) => updateIntensifySubject(subject.id, 'intensifyIn', value)}
                          disabled={!subject.intensifyInYear}
                        >
                          <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                            <SelectValue placeholder="Seleccionar materia" />
                          </SelectTrigger>
                          <SelectContent>
                            {subject.intensifyInYear && getSubjectsForYear(subject.intensifyInYear).map(subjectName => (
                              <SelectItem key={subjectName} value={subjectName}>{subjectName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-yellow-700 font-medium">Año y sección</Label>
                      <Select
                        value={subject.yearSection}
                        onValueChange={(value) => updateIntensifySubject(subject.id, 'yearSection', value)}
                        disabled={!subject.intensifyInYear}
                      >
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                          <SelectValue placeholder="Seleccionar sección" />
                        </SelectTrigger>
                        <SelectContent>
                          {subject.intensifyInYear && getAvailableSections(subject.intensifyInYear).map(section => (
                            <SelectItem key={section} value={`${subject.intensifyInYear.split(" ")[0]} ${section}`}>
                              {subject.intensifyInYear.split(" ")[0]} {section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-yellow-700 font-medium">Días y horarios</Label>
                      <Input
                        value={subject.daysSchedule}
                        onChange={(e) => updateIntensifySubject(subject.id, 'daysSchedule', e.target.value)}
                        placeholder="Ej: lunes de 19:20 a 21:20"
                        className="border-yellow-200 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label className="text-yellow-700 font-medium">Turno</Label>
                      <Select
                        value={subject.shift}
                        onValueChange={(value) => updateIntensifySubject(subject.id, 'shift', value)}
                      >
                        <SelectTrigger className="border-yellow-200 focus:border-yellow-500">
                          <SelectValue placeholder="Seleccionar turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Vespertino">Vespertino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addIntensifySubject} 
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Materia a Intensificar
              </Button>
            </CardContent>
          </Card>

          {/* Materias a Recursar */}
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-orange-100">
              <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                Materias a RECURSAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {formData.recourseSubjects.map((subject, index) => (
                <div key={subject.id} className="border-2 border-orange-200 rounded-lg p-4 space-y-4 bg-orange-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-orange-800">Materia {index + 1}</h4>
                    {formData.recourseSubjects.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecourseSubject(subject.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-orange-700 font-medium">Año de la materia</Label>
                      <Select
                        value={subject.year}
                        onValueChange={(value) => {
                          updateRecourseSubject(subject.id, 'year', value)
                          updateRecourseSubject(subject.id, 'subjectName', '') // Reset subject when year changes
                        }}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-500">
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-orange-700 font-medium">Materia a recursar</Label>
                      <Select
                        value={subject.subjectName}
                        onValueChange={(value) => updateRecourseSubject(subject.id, 'subjectName', value)}
                        disabled={!subject.year}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-500">
                          <SelectValue placeholder="Seleccionar materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {subject.year && getSubjectsForYear(subject.year).map(subjectName => (
                            <SelectItem key={subjectName} value={subjectName}>{subjectName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-orange-700 font-medium">Año y sección en que recursa</Label>
                      <Input
                        value={subject.yearSection}
                        onChange={(e) => updateRecourseSubject(subject.id, 'yearSection', e.target.value)}
                        placeholder="Ej: 5° 1era"
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label className="text-orange-700 font-medium">Día/s y horario/s</Label>
                      <Input
                        value={subject.daysSchedule}
                        onChange={(e) => updateRecourseSubject(subject.id, 'daysSchedule', e.target.value)}
                        placeholder="Ej: lunes de 7:40 a 11:50"
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label className="text-orange-700 font-medium">Turno</Label>
                      <Select
                        value={subject.shift}
                        onValueChange={(value) => updateRecourseSubject(subject.id, 'shift', value)}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-orange-500">
                          <SelectValue placeholder="Seleccionar turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Vespertino">Vespertino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addRecourseSubject} 
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Materia a Recursar
              </Button>
            </CardContent>
          </Card>

          {/* Materias que NO podrá cursar */}
          <Card className="border-2 border-red-200 shadow-md">
            <CardHeader className="bg-red-100">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Materias que NO podrá cursar este ciclo lectivo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.cannotTakeSubjects}
                onChange={(e) => setFormData(prev => ({ ...prev, cannotTakeSubjects: e.target.value }))}
                placeholder="Detalle las materias que el estudiante no podrá cursar en este ciclo lectivo..."
                rows={4}
                className="border-red-200 focus:border-red-500"
              />
            </CardContent>
          </Card>

          {/* Botones de Generación */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={generateNotification}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 shadow-lg"
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Generar NOTIFICACIÓN
                </Button>
                <Button
                  onClick={generateActa}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 shadow-lg"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Generar ACTA DE REUNIÓN
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
