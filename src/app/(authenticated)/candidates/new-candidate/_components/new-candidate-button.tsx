import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";

interface NewCandidateButtonProps {
  disabled?: boolean;
}

export default function NewCandidateButton({
  disabled = false,
}: NewCandidateButtonProps) {
  return (
    <Button type="submit" disabled={disabled}>
      {disabled ? "Guardando..." : "Guardar candidato"}

      {!disabled && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}