"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Plus,
  Search,
  ChevronDown,
  FileText,
  Globe,
  Send,
  Users,
  Briefcase,
} from "lucide-react";
//import { FaLinkedin } from "react-icons/fa";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { api } from "~/lib/trpc/react";

/* ============================================================
   TIPOS Y DATOS ESTÁTICOS
============================================================ */

type TagType = "purple" | "blue" | "green" | "orange";

interface Tag {
  label: string;
  type: TagType;
}

interface CandidateRow {
  id: string;
  initials: string;
  name: string;
  avatarBg: string;
  tags: Tag[];
  vacante: string;
  rol: string;
  seniority: "Senior" | "Mid-Senior" | "Mid";
  area: string;
  sourceText: string;
  sourceIcon: React.ReactNode;
  hasCv: boolean;
  hasLinkedin: boolean;
  linkedinUrl: string;
  email: string;
}

const getTagClasses = (type: TagType) => {
  switch (type) {
    case "purple":
      return "bg-dashboard-purple-avatar text-dashboard-purple-text";
    case "blue":
      return "bg-dashboard-sky-avatar text-dashboard-sky-text";
    case "green":
      return "bg-dashboard-success-avatar text-dashboard-success-text";
    case "orange":
      return "bg-dashboard-orange-light text-dashboard-orange-text";
    default:
      return "bg-dashboard-track text-dashboard-text-muted";
  }
};

const getSeniorityClasses = (seniority: CandidateRow["seniority"]) => {
  switch (seniority) {
    case "Senior":
      return "bg-dashboard-success-light text-dashboard-success-text";
    case "Mid-Senior":
      return "bg-dashboard-orange-light text-dashboard-orange-text";
    case "Mid":
      return "bg-dashboard-sky-avatar text-dashboard-sky-text";
    default:
      return "bg-dashboard-track text-dashboard-text-muted";
  }
};

const avatarPalette = [
  "bg-dashboard-success-avatar text-dashboard-success-text",
  "bg-dashboard-purple-avatar text-dashboard-purple-text",
  "bg-dashboard-orange-light text-dashboard-orange-text",
  "bg-dashboard-slate-avatar text-dashboard-slate-text",
  "bg-dashboard-sky-avatar text-dashboard-sky-text",
];

/* ================================
*        fetch de candidatos
   ============================== */

const candidatesData: CandidateRow[] = [
  {
    id: "1",
    initials: "LM",
    name: "Laura Méndez",
    avatarBg: avatarPalette[0],
    tags: [
      { label: "UX", type: "purple" },
      { label: "Figma", type: "blue" },
    ],
    vacante: "Sr. Frontend Developer",
    rol: "UX Designer",
    seniority: "Senior",
    area: "Diseño",
    sourceText: "LinkedIn",
    sourceIcon: <>{/*<FaLinkedin size={14} className="text-[#0a66c2]" />*/}</>,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/lauramendez",
    email: "laura.mendez@ejemplo.com",
  },
  {
    id: "2",
    initials: "CR",
    name: "Carlos Ruiz",
    avatarBg: avatarPalette[1],
    tags: [
      { label: "Node", type: "green" },
      { label: "Postgres", type: "blue" },
    ],
    vacante: "Sr. Node js Developer",
    rol: "Backend Engineer",
    seniority: "Mid-Senior",
    area: "Tecnología",
    sourceText: "Outbound",
    sourceIcon: <Send size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/carlosruiz",
    email: "cruiz.dev@ejemplo.com",
  },
  {
    id: "3",
    initials: "MF",
    name: "María Flores",
    avatarBg: avatarPalette[2],
    tags: [{ label: "Estrategia", type: "purple" }],
    vacante: "Product Designer",
    rol: "Product Manager",
    seniority: "Senior",
    area: "Producto",
    sourceText: "Página Web",
    sourceIcon: <Globe size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/mariaflores",
    email: "mariaf.pm@ejemplo.com",
  },
  {
    id: "4",
    initials: "JV",
    name: "Julián Vargas",
    avatarBg: avatarPalette[3],
    tags: [{ label: "SQL", type: "blue" }],
    vacante: "—",
    rol: "Data Analyst",
    seniority: "Mid",
    area: "Datos",
    sourceText: "Referido",
    sourceIcon: <Users size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/julianvargas",
    email: "jvargas.data@ejemplo.com",
  },
  {
    id: "5",
    initials: "SP",
    name: "Sofía Paredes",
    avatarBg: avatarPalette[3],
    tags: [{ label: "UX Writing", type: "purple" }],
    vacante: "—",
    rol: "UX Writer",
    seniority: "Mid",
    area: "Experiencia de Usuario",
    sourceText: "Portal de empleos",
    sourceIcon: <Briefcase size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/sofiaparedes",
    email: "sparedes.ux@ejemplo.com",
  },
  {
    id: "6",
    initials: "RM",
    name: "Roberto Mora",
    avatarBg: avatarPalette[0],
    tags: [
      { label: "Go", type: "blue" },
      { label: "Sr.", type: "purple" },
    ],
    vacante: "Sr. Node js Developer",
    rol: "Backend Engineer",
    seniority: "Mid-Senior",
    area: "Tecnología",
    sourceText: "LinkedIn",
    sourceIcon: <>{/*<FaLinkedin size={14} className="text-[#0a66c2]" />*/}</>,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/robertomora",
    email: "rmora.backend@ejemplo.com",
  },
  {
    id: "7",
    initials: "KL",
    name: "Karen López",
    avatarBg: avatarPalette[1],
    tags: [{ label: "Growth", type: "orange" }],
    vacante: "Product Designer",
    rol: "Product Manager",
    seniority: "Senior",
    area: "Producto",
    sourceText: "Outbound",
    sourceIcon: <Send size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/karenlopez",
    email: "klopez.growth@ejemplo.com",
  },
  {
    id: "8",
    initials: "PG",
    name: "Paula Gómez",
    avatarBg: avatarPalette[4],
    tags: [{ label: "Cypress", type: "green" }],
    vacante: "—",
    rol: "QA Engineer",
    seniority: "Mid",
    area: "Tecnología",
    sourceText: "Página Web",
    sourceIcon: <Globe size={14} className="text-dashboard-text-muted" />,
    hasCv: true,
    hasLinkedin: true,
    linkedinUrl: "https://www.linkedin.com/in/paulagomez",
    email: "pgomez.qa@ejemplo.com",
  },
];

/* ============================================================
   CONFIGURACIÓN DE FILTROS
============================================================ */

const filterConfigs = [
  {
    id: "Vacantes",
    label: "Todas las vacantes",
    options: [
      "Sr. Frontend Developer",
      "Sr. Node js Developer",
      "Product Designer",
    ],
  },
  {
    id: "Roles",
    label: "Todos los roles",
    options: [
      "UX Designer",
      "Backend Engineer",
      "Product Manager",
      "Data Analyst",
      "UX Writer",
      "QA Engineer",
    ],
  },
  {
    id: "Seniority",
    label: "Seniority",
    options: ["Senior", "Mid-Senior", "Mid"],
  },
  {
    id: "Área",
    label: "Área",
    options: [
      "Diseño",
      "Tecnología",
      "Producto",
      "Datos",
      "Experiencia de Usuario",
    ],
  },
  {
    id: "Source",
    label: "Source",
    options: [
      "LinkedIn",
      "Outbound",
      "Página Web",
      "Referido",
      "Portal de empleos",
    ],
  },
  {
    id: "Etiquetas",
    label: "Etiquetas",
    options: [
      { label: "Go", type: "blue" as TagType },
      { label: "Sr.", type: "purple" as TagType },
      { label: "Node", type: "green" as TagType },
      { label: "Postgres", type: "blue" as TagType },
      { label: "UX", type: "purple" as TagType },
      { label: "Growth", type: "orange" as TagType },
      { label: "Cypress", type: "green" as TagType },
      { label: "Figma", type: "blue" as TagType },
      { label: "Estrategia", type: "purple" as TagType },
      { label: "SQL", type: "blue" as TagType },
      { label: "UX Writing", type: "purple" as TagType },
    ],
  },
];

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function CandidatosPage() {
  const router = useRouter();

  const [selections, setSelections] = useState<Record<string, string[]>>({
    Vacantes: [],
    Roles: [],
    Seniority: [],
    Área: [],
    Source: [],
    Etiquetas: [],
  });

  const handleSelectionToggle = (filterId: string, option: string) => {
    setSelections((prev) => {
      const current = prev[filterId] || [];
      return {
        ...prev,
        [filterId]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const clearSelection = (filterId: string) => {
    setSelections((prev) => ({ ...prev, [filterId]: [] }));
  };

  const handleCandidateClick = (candidateId: string) => {
    router.push(`/candidatos/${candidateId}`);
  };
  const { data, isLoading, error } = api.candidate.fetchCandidates.useQuery();
  console.log(data?.candidates[0]);
  return (
    <div className="flex-1 min-w-0 w-full max-w-full p-8 font-sans text-dashboard-text-primary overflow-x-hidden">
      {/* Cabezal */}
      <p>ME LLAMOOOOOOO {data?.candidates[0].name}</p>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-dashboard-dark">
            Candidatos
          </h1>
          <p className="mt-0.5 text-base font-medium text-dashboard-text-muted">
            142 candidatos activos en 8 vacantes
          </p>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full border-dashboard-border bg-white px-5 py-5 text-sm font-medium text-dashboard-text-secondary shadow-xs hover:bg-dashboard-track hover:text-dashboard-text-secondary"
          >
            <Download size={16} className="text-dashboard-text-muted" />
            <span>Exportar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/candidatos/alta")}
            className="h-9 gap-1.5 rounded-full bg-dashboard-dark px-5 py-5 text-sm font-medium text-white shadow-xs hover:bg-dashboard-dark-hover"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Añadir</span>
          </Button>
        </div>
      </header>

      {/* Búsqueda y filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-56 shrink-0">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dashboard-text-muted"
          />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            className="h-8 rounded-lg border-dashboard-border bg-white pl-9 text-sm shadow-sm"
          />
        </div>

        {filterConfigs.map((config) => {
          const count = selections[config.id]?.length || 0;
          const buttonText =
            count > 0 ? `${config.id} · ${count}` : config.label;

          return (
            <Popover key={config.id}>
              <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-dashboard-border bg-white px-4 text-sm font-medium text-dashboard-text-secondary shadow-sm transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text">
                <span>{buttonText}</span>
                <ChevronDown size={14} className="text-dashboard-text-muted" />
              </PopoverTrigger>

              <PopoverContent align="start" className="w-56 rounded-xl p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dashboard-text-light">
                  Filtrar por {config.id.toLowerCase()}
                </p>

                <Input
                  type="text"
                  placeholder={`Buscar ${config.id.toLowerCase()}...`}
                  className="mb-3 h-8 rounded-md border-dashboard-border bg-dashboard-track/40 text-sm"
                />

                <div className="mb-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
                  {config.options.map((opt) => {
                    const isTag = typeof opt !== "string";
                    const label = isTag ? opt.label : opt;
                    const isChecked = selections[config.id]?.includes(label);

                    return (
                      <label
                        key={label}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() =>
                            handleSelectionToggle(config.id, label)
                          }
                        />

                        {isTag ? (
                          <Badge
                            variant="secondary"
                            className={`rounded-full border-transparent px-2 py-0.5 text-xs font-bold ${getTagClasses(
                              opt.type
                            )}`}
                          >
                            {label}
                          </Badge>
                        ) : (
                          <span className="text-sm font-medium text-dashboard-text-secondary">
                            {label}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearSelection(config.id)}
                  className="h-auto p-0 text-xs font-bold text-dashboard-text-muted hover:bg-transparent hover:text-dashboard-success-text"
                >
                  Limpiar
                </Button>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* ====================================================
          TABLA DE CANDIDATOS
      ==================================================== */}
      <div className="w-full overflow-x-auto rounded-xl border border-dashboard-border bg-white shadow-sm">
        <Table className="min-w-262.5">
          <TableHeader>
            <TableRow className="border-b border-dashboard-border hover:bg-transparent">
              <TableHead className="h-10 px-3 py-4 pl-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Candidato
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Etiquetas
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Vacante
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Rol
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Seniority
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Área
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Source
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                CV
              </TableHead>
              <TableHead className="h-10 px-3 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                LinkedIn
              </TableHead>
              <TableHead className="h-10 px-3 py-4 pr-5 text-sm font-bold uppercase tracking-[0.06em] text-dashboard-text-light">
                Correo Electrónico
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-dashboard-border">
            {candidatesData.map((c) => (
              <TableRow
                key={c.id}
                onClick={() => handleCandidateClick(c.id)}
                className="group cursor-pointer border-b border-dashboard-border transition-colors hover:bg-dashboard-success-light last:border-0"
              >
                {/* Candidato */}
                <TableCell className="px-5 py-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${c.avatarBg}`}
                    >
                      {c.initials}
                    </div>
                    <span className="max-w-36 truncate text-sm font-bold text-dashboard-dark">
                      {c.name}
                    </span>
                  </div>
                </TableCell>

                {/* Etiquetas */}
                <TableCell className="px-3 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {c.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={`rounded-full border-transparent px-2 py-0.5 text-xs font-bold ${getTagClasses(
                          tag.type
                        )}`}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>

                {/* Vacante */}
                <TableCell className="px-3 py-4">
                  <div
                    className="max-w-44 truncate text-sm font-semibold text-dashboard-text-secondary"
                    title={c.vacante}
                  >
                    {c.vacante}
                  </div>
                </TableCell>

                {/* Rol */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-secondary">
                  {c.rol}
                </TableCell>

                {/* Seniority */}
                <TableCell className="px-3 py-4">
                  <Badge
                    variant="secondary"
                    className={`rounded-md border-transparent px-2 py-1 text-xs font-bold ${getSeniorityClasses(
                      c.seniority
                    )}`}
                  >
                    {c.seniority}
                  </Badge>
                </TableCell>

                {/* Área */}
                <TableCell className="px-3 py-4 text-sm font-medium text-dashboard-text-secondary">
                  {c.area}
                </TableCell>

                {/* Source */}
                <TableCell className="px-3 py-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-dashboard-text-secondary">
                    <span className="shrink-0">{c.sourceIcon}</span>
                    <span className="truncate">{c.sourceText}</span>
                  </div>
                </TableCell>

                {/* CV */}
                <TableCell className="px-3 py-4 text-center">
                  {c.hasCv && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-7 text-dashboard-text-muted hover:bg-dashboard-track hover:text-dashboard-dark"
                      title="Ver CV"
                    >
                      <FileText size={15} />
                    </Button>
                  )}
                </TableCell>

                {/* LinkedIn */}
                <TableCell className="px-3 py-4 text-center">
                  {c.hasLinkedin && c.linkedinUrl ? (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Ver perfil de LinkedIn"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0a66c2] transition-colors hover:bg-dashboard-track hover:text-[#004182]"
                    >
                      {/*<FaLinkedin size={15} />*/}
                    </a>
                  ) : null}
                </TableCell>

                {/* Email */}
                <TableCell className="px-3 py-4 pr-5">
                  <div
                    className="max-w-48 truncate text-sm font-medium text-dashboard-text-secondary"
                    title={c.email}
                  >
                    {c.email}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación*/}
      <div className="mt-4 flex items-center justify-between pb-6">
        <p className="text-sm font-medium text-dashboard-text-secondary">
          Mostrando 1 - 8 de 142 candidatos
        </p>

        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                isActive
                className="h-7 w-7 rounded-md bg-dashboard-dark text-sm font-bold text-white shadow-sm hover:bg-dashboard-dark-hover hover:text-white"
              >
                1
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href="#"
                className="h-7 w-7 rounded-md text-sm font-semibold text-dashboard-text-secondary hover:bg-dashboard-track"
              >
                2
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                className="h-7 w-7 rounded-md p-0 text-dashboard-text-muted hover:bg-dashboard-track [&>span]:hidden"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}