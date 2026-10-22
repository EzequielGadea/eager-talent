export async function register() {
  // Solo en el runtime de Node (Prisma y nodemailer no funcionan en edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapFirstUser } = await import("~/lib/bootstrap");
    await bootstrapFirstUser();
  }
}
