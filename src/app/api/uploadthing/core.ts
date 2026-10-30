import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { auth } from "~/lib/auth";

const upload = createUploadthing();

export const ourFileRouter = {
  applicantFiles: upload({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session) {
        throw new UploadThingError("No autorizado");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(({ file }) => {
      return {
        url: file.url,
        name: file.name,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
