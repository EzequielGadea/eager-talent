import { Button } from "~/components/ui/button";

import { ArrowRight } from "lucide-react";

interface NewJobOpeningButtonProps {
  disabled?: boolean;
}

export default function NewJobOpeningButton({
  disabled = false,
}: NewJobOpeningButtonProps) {
  return (
    <Button type="submit" disabled={disabled}>
      {disabled ? "Creando..." : "Crear vacante"}

      {!disabled && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}
