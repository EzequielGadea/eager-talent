import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function NewCandidateButton() {
  return (
    <Button type="submit">
      Guardar candidato
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}