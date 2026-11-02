import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function UsersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="px-4 py-3 pl-6">Usuario</TableHead>
        <TableHead className="px-4 py-3">Email</TableHead>
        <TableHead className="px-4 py-3">Rol</TableHead>
        <TableHead className="px-4 py-3">Acceso</TableHead>
        <TableHead className="px-4 py-3">Estado</TableHead>
        <TableHead className="px-4 py-3">Último acceso</TableHead>
        <TableHead className="w-12 px-4 py-3">
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
