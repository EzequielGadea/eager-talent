import { protectedProcedure } from "~/server/api/trpc";
import { profileSchema } from "~/lib/validations/profile";

// TODO(backend): save the profile photo. Upload it with UploadThing and store
// the returned URL in `User.image` (no migration needed).

// Always scoped to the session user; no userId input is accepted.
// Email is intentionally not editable here.
export const updateCurrent = protectedProcedure
  .input(profileSchema)
  .mutation(({ ctx, input }) =>
    ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { name: input.name, lastName: input.lastName },
      select: { name: true, lastName: true },
    }),
  );
