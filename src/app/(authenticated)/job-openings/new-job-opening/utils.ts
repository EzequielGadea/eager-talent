export type Stages = Stage[];

export type Stage = {
  key: string;
  name: string;
  type: string;
  label: string;
  color: string;
};

export type Template = { id: string; stages: Stages };

export function hasDuplicatedNames(data: Stages): boolean {
  const set = new Set<string>();
  data.forEach((stage) => {
    //Elimina multiples espacios consecutivos
    const trimmed = stage.name
      .split(" ")
      .filter((word) => word !== "")
      .join(" ");
    set.add(trimmed);
  });
  return data.length > set.size;
}

export const mandatoryStages = [
  "Aplicado",
  "Oferta",
  "Entrevista HR",
  "Entrevista técnica",
  "Contrado/a",
];
