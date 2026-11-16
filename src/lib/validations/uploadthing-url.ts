import { z } from "zod";

import { getUploadthingAppId } from "~/lib/uploadthing-app-id";

export const uploadthingUrlSchema = z.string().refine((value) => {
  const appId = getUploadthingAppId();
  // Fail closed: without an app id we cannot trust any URL.
  if (!appId) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === `${appId}.ufs.sh` &&
      url.pathname.startsWith("/f/") &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}, "La URL no pertenece al almacenamiento de la app");
