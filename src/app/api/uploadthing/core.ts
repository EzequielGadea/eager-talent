import { createUploadthing, type FileRouter } from "uploadthing/next";

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
  }).onUploadComplete(({ file }) => {
    return {
      url: file.url,
      name: file.name,
      key: file.key,
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
