import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";

interface NewApplicantButtonProps {
  disabled?: boolean;
}

export default function NewApplicantButton({
  disabled = false,
}: NewApplicantButtonProps) {
  return (
    <Button type="submit" disabled={disabled}>
      {disabled ? "Guardando..." : "Guardar candidato"}

      {!disabled && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}
