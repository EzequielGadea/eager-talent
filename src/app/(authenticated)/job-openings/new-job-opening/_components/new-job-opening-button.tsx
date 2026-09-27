import { Button } from "~/components/ui/button";

import { ArrowRight } from "lucide-react";

interface NewJobOpeningButtonProps {
  disabled?: boolean;
}

export default function NewJobOpeningButton({
  disabled = false,
}: NewJobOpeningButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="h-8.5 gap-2 rounded-full bg-dashboard-dark px-4 text-[13px] font-semibold text-white shadow-none hover:bg-dashboard-dark-hover"
    >
      {disabled ? "Creando..." : "Crear vacante"}

      {!disabled && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
}
