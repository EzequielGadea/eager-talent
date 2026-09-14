'use client'

import {
  Search,
  ChevronDown,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useState } from "react";

import { ApplicantInfo } from "../types";

const filterConfigs = [ //TODO recibir las options de cada uno dinamico de DB
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
    label: "Fuente",
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

    ],
  },
];

export function Filters({ applicants } : {applicants : ApplicantInfo[] }) {

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

    return (
      <>
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
              <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-dashboard-border bg-white px-4 text-sm font-medium text-dashboard-text-muted shadow-sm transition-colors hover:bg-dashboard-success-light hover:text-dashboard-success-text">
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
                    const label = isTag ? "test label"/*opt.label*/ : opt;
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
                            className={`rounded-full border-transparent px-2 py-0.5 text-xs font-bold`}
                          >
                            {label}
                          </Badge>
                        ) : (
                          <span className="text-sm font-medium text-dashboard-text-muted">
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
      </>
    )
}