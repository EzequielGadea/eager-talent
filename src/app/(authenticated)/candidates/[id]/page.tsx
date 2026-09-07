"use client";

import { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Mail,
  Phone,
  MapPin,
  User,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  HelpCircle,
  FileText,
  Download,
  Plus,
  Check,
  Share2,
  Bold,
  Italic,
  Underline,
  List,
  Video,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
//import { FaLinkedin } from "react-icons/fa";

// Assume standard Shadcn UI component imports
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";

export default function CandidateProfilePage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id as string;

  const interview = {
    id: "5",
    title: "Entrevista Técnica",
    status: "Completada",
    interviewers: "Luis Torres, Diego F.",
    type: "Videollamada",
    duration: "52 min",
    date: "14 jun 2026 · 15:00",
  };

  const notesRef = useRef<HTMLDivElement>(null);
  const [noteStatus, setNoteStatus] = useState("Guardado ahora mismo");

  const handleNoteInput = () => {
    setNoteStatus("Guardando...");
    setTimeout(() => {
      setNoteStatus("Guardado ahora mismo");
    }, 600);
  };

  const formatText = (
    command: "bold" | "italic" | "underline" | "insertUnorderedList"
  ) => {
    notesRef.current?.focus();
    document.execCommand(command, false);
    handleNoteInput();
  };

  return (
    <main className="flex-1 p-8 font-sans">
      <Button
        variant="link"
        className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-dashboard-blue hover:underline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* ==================================================
                     PERFIL
          ================================================== */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                  SG
                </div>

                {/* Header Info */}
                <div className="flex w-full min-w-0 flex-col">
                  {/* Name */}
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-2xl font-bold tracking-tight">
                      Santiago González
                    </h1>
                    <Star className="h-5 w-5 shrink-0 fill-amber-500 text-amber-500" />
                  </div>

                  {/* Status & Role */}
                  <div className="mt-2 flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1.5 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />
                      En proceso
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      Software Engineer
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground/70" />
                        <span>santiago.gonzalez@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground/70" />
                        <span>+54 11 2345 5678</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground/70" />
                        <span>Argentina</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {/*<FaLinkedin className="h-4 w-4 text-[#0a66c2]" >*/}
                        <a href="#" className="text-blue-600 hover:underline font-medium">
                          linkedin.com/in/santiagogonzalez
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground/70" />
                        <span>Source: LinkedIn Recruiter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Bottom Stats Row */}
              <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rol
                  </span>
                  <span className="text-sm font-bold">Software Engineer</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seniority
                  </span>
                  <span className="text-sm font-bold">Senior</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nivel de inglés
                  </span>
                  <span className="text-sm font-bold">Advanced (C1)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Fuente
                  </span>
                  <span className="text-sm font-bold">LinkedIn Recruiter</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Académica */}
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <div className="mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Formación
                  </span>
                </div>
                <h3 className="text-sm font-bold">Ing. en Sistemas</h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Universidad de Buenos Aires · 2016–2021
                </p>
              </CardContent>
            </Card>

            {/* ¿Cómo nos escuchó? */}
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <div className="mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    ¿Cómo nos escuchó?
                  </span>
                </div>
                <h3 className="text-sm font-bold">A través de LinkedIn</h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Búsqueda activa
                </p>
              </CardContent>
            </Card>

            {/* CV */}
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    CV
                  </span>
                </div>
                <h3 className="truncate text-sm font-bold">santiago_cv.pdf</h3>
                <Button variant="link" className="mt-1 h-auto p-0 text-xs text-blue-600 justify-start">
                  Descargar <Download className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Escolaridad */}
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Escolaridad
                  </span>
                </div>
                <h3 className="truncate text-sm font-bold">certificado.pdf</h3>
                <Button variant="link" className="mt-1 h-auto p-0 text-xs text-blue-600 justify-start">
                  Descargar <Download className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ==================================================
                     POSTULACIONES
          ================================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow-sm px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-base font-bold">Postulaciones</h2>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  — el candidato puede postularse a varias vacantes
                </span>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Postular a vacante
              </Button>
            </div>

            {/* Postulación Activa */}
            <Card className="border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                        Backend Developer
                      </h3>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-100 gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        En proceso · Entrevista Técnica
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium text-muted-foreground">
                          Salario pretendido:
                        </span>
                        <span className="font-bold">USD 3.000 – 3.500</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-muted-foreground">
                          Disponibilidad:
                        </span>
                        <span className="font-bold">Inmediata</span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Postuló: 8 jun 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-emerald-600">
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Viendo
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Postulación Descartada */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-bold">Sr. Node.js Developer</h3>
                      <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 font-bold uppercase tracking-wide text-[10px]">
                        Descartado
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium text-muted-foreground">
                          Última etapa:
                        </span>
                        <span className="font-semibold">Entrevista HR</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-medium text-muted-foreground">Motivo:</span>
                        <span className="font-bold text-red-600">
                          No calificaba para la vacante
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Postuló: 4 mar 2026</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="link" className="h-auto p-0 text-blue-600 font-semibold sm:shrink-0 justify-start">
                    Ver detalle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ==================================================
                     DETALLE POSTULACIÓN
          ================================================== */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b">
              <div className="flex items-center gap-2 text-base font-bold">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">
                  Postulación ·
                </span>
                Backend Developer
              </div>
              <Button size="sm" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </CardHeader>

            <Tabs defaultValue="entrevistas" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 py-0 h-auto gap-6">
                <TabsTrigger
                  value="entrevistas"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 data-[state=active]:shadow-none font-bold text-sm"
                >
                  Entrevistas
                  <Badge variant="secondary" className="ml-2 px-1.5 min-w-5 justify-center">
                    5
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="actividades"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 data-[state=active]:shadow-none font-bold text-sm text-muted-foreground"
                >
                  Actividades
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entrevistas" className="p-6 focus-visible:outline-none">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-bold">
                    Historial de entrevistas
                  </h3>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar entrevista
                  </Button>
                </div>

                <Card
                  className="group cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md"
                  onClick={() => router.push(`/candidatos/${candidateId}/entrevista-${interview.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-3">
                        {/* Title */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-base font-bold transition-colors group-hover:text-emerald-600">
                            {interview.title}
                          </h4>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-bold">
                            <Check className="h-3 w-3" strokeWidth={3} />
                            {interview.status}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{interview.interviewers}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span>{interview.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{interview.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Date + arrow */}
                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {interview.date}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="actividades" className="p-6">
                <div className="text-sm text-muted-foreground text-center py-8">
                  No hay actividades recientes para mostrar.
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* ==================================================
                   NOTAS / COMENTARIOS SIDEBAR
        ================================================== */}
        <div className="sticky top-8 flex flex-col lg:col-span-4 h-[calc(100vh-4rem)] max-h-200">
          <Card className="flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b space-y-0 bg-muted/30">
              <CardTitle className="text-base font-bold">
                Notas / Comentarios
              </CardTitle>
              <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {noteStatus}
              </div>
            </CardHeader>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2 bg-muted/10">
              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
                Normal <span className="ml-1 text-[8px]">▼</span>
              </Button>

              <Separator orientation="vertical" className="mx-1 h-5" />

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => formatText("bold")} title="Negrita">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => formatText("italic")} title="Cursiva">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => formatText("underline")} title="Subrayado">
                  <Underline className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="mx-1 h-5" />

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => formatText("insertUnorderedList")} title="Lista">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Insertar enlace">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor */}
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div
                ref={notesRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleNoteInput}
                className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed text-muted-foreground outline-none focus-visible:ring-0 focus-visible:outline-none"
              >
                <p className="mb-4">
                  Muy buen desempeño en la entrevista técnica.
                </p>
                <p className="mb-4">
                  Demuestra sólidos conocimientos en sistemas distribuidos y
                  buenas prácticas. Buena comunicación y actitud colaborativa.
                </p>
                <p>
                  <strong className="font-bold text-foreground">
                    Siguiente paso:
                  </strong>{" "}
                  entrevista con liderazgo.
                  <br />
                  Evaluar fit cultural con el equipo de Backend.
                </p>
              </div>
            </CardContent>

            <CardFooter className="border-t px-5 py-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">
                Última edición: ahora mismo
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}