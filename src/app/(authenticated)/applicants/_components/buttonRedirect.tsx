"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function ButtonRedirect() {
    const router = useRouter();
    return (        <div className="flex flex-col gap-4 align-center justify-center">
        <Button onClick={() => redirect()}>
            Nuevo Candidato
        </Button>
    </div>);


        function redirect() {
      router.push("/applicants/new-applicant");
    }
}