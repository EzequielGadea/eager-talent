import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "~/components/ui/table";

import { UserRow, type User } from "./user-row";
import { UsersTableHeader } from "./users-table-header";

type UsersTableProps= {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
      <Table >
        <UsersTableHeader />

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-text-secondary"
              >
                No hay usuarios para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => <UserRow key={user.id} user={user} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}