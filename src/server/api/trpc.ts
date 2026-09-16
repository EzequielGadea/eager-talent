import { TRPCError, initTRPC } from "@trpc/server";
import { Prisma } from "~/generated/prisma/client";
import { auth } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });

  return {
    db: prisma,
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const errorHandlingMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    console.error("Error inesperado:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Error al procesar la solicitud.",
        cause: error,
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado.",
      cause: error,
    });
  }
});

export const protectedProcedure = t.procedure
  .use(errorHandlingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  });

/*export const recruiterProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "RECLUTADOR") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tenés permisos para acceder a este recurso.",
    });
  }

  return next({ ctx });
});*/
