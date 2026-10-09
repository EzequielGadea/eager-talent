import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead>Usuario</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Rol</TableHead>
        <TableHead>Acceso</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Último acceso</TableHead>
        <TableHead className="w-12">
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
