import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="px-4 py-3 pl-6 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Usuario
        </TableHead>
        <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Email
        </TableHead>
        <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Rol
        </TableHead>
        <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Acceso
        </TableHead>
        <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Estado
        </TableHead>
        <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Último acceso
        </TableHead>
        <TableHead className="w-12 px-4 py-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
