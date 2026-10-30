import { UserActionsMenu } from "./user-actions-menu";
import { LastAccessText, type User } from "./user-row";
import { userRoleConfig, userStatusConfig } from "../constants";
import getAvatar from "~/lib/avatar";

const PENDING_NAME_LABEL = "Pendiente";

type UsersCardListProps = {
  users: User[];
};

export function UsersCardList({ users }: UsersCardListProps) {
  return (
    <ul className="divide-y divide-border-default rounded-lg border border-border-default bg-surface-card md:hidden">
      {users.length === 0 ? (
        <li className="px-4 py-8 text-center text-sm text-text-secondary">
          No hay usuarios para mostrar.
        </li>
      ) : (
        users.map((user) => {
          const status = userStatusConfig[user.status];
          const role =
            user.role === "recruiter"
              ? userRoleConfig.recruiter
              : userRoleConfig.hiringManager;
          const fullName = `${user.name} ${user.lastName}`.trim();
          const avatar = getAvatar(user.name, user.lastName);
          const access =
            user.role === "recruiter"
              ? "Todo el sistema"
              : `${user.assignedJobOpeningsCount} ${
                  user.assignedJobOpeningsCount === 1 ? "vacante" : "vacantes"
                }`;

          return (
            <li key={user.id}>
              <article className="flex flex-col gap-3 px-4 py-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatar.colorClass}`}
                    >
                      {avatar.initials || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-text-primary">
                        {fullName || PENDING_NAME_LABEL}
                      </p>
                      <p className="break-all text-xs text-text-secondary">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <UserActionsMenu user={user} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${role.className}`}
                  >
                    {role.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {status.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-text-secondary">Acceso</dt>
                    <dd className="break-words font-medium text-text-primary">
                      {access}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-text-secondary">Último acceso</dt>
                    <dd className="font-medium text-text-primary">
                      <LastAccessText lastAccess={user.lastAccess} />
                    </dd>
                  </div>
                </dl>
              </article>
            </li>
          );
        })
      )}
    </ul>
  );
}
