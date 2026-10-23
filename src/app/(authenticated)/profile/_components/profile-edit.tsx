"use client";

import Image from "next/image";
import { type ChangeEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast";
import getAvatar from "~/lib/avatar";
import { api } from "~/lib/trpc/react";
import { useUploadThing } from "~/lib/uploadthing";
import {
  profileImageSchema,
  profileSchema,
  type ProfileFormData,
} from "~/lib/validations/profile";

type ProfileEditProps = {
  user: {
    name: string;
    lastName: string;
    email: string;
    image: string | null;
  };
  onDone: () => void;
};

async function isDecodableImage(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}

export function ProfileEdit({ user, onDone }: ProfileEditProps) {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.image);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      lastName: user.lastName,
    },
  });

  const [name, lastName] = useWatch({
    control,
    name: ["name", "lastName"],
  });

  const avatar = getAvatar(name ?? "", lastName ?? "");
  const originalAvatar = getAvatar(user.name, user.lastName);

  const { startUpload, isUploading } = useUploadThing("applicantFiles", {
    onUploadError: (error) => {
      toast.add({
        title: error.message || "No se pudo subir la imagen.",
        type: "error",
      });
    },
  });

  const updateCurrent = api.user.updateCurrent.useMutation({
    onError: (error) => {
      toast.add({
        title: error.message,
        type: "error",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        onDone();
      });
    },
  });

  const isSaving =
    updateCurrent.isPending || isTransitionPending || isUploading;

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const result = profileImageSchema.safeParse(file);

    if (!result.success) {
      setImageError(
        result.error.issues[0]?.message ?? "La imagen no es válida.",
      );
      return;
    }

    if (!(await isDecodableImage(file))) {
      setImageError("El archivo no es una imagen válida.");
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImageRemoved(false);
    setIsImageZoomed(false);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };

    reader.onerror = () => {
      setImageError("No se pudo cargar la vista previa de la imagen.");
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setPreview(null);
    setImageRemoved(true);
    setImageError(null);
    setIsImageZoomed(false);
  }

  async function onSubmit(values: ProfileFormData) {
    setImageError(null);

    if (imageFile) {
      try {
        const uploadedFiles = await startUpload([imageFile]);
        const imageUrl = uploadedFiles?.[0]?.url;

        if (!imageUrl) {
          toast.add({
            title: "No se pudo obtener la URL de la imagen.",
            type: "error",
          });
          return;
        }

        updateCurrent.mutate({
          ...values,
          image: imageUrl,
        });
      } catch {
        toast.add({
          title: "Ocurrió un error al subir la imagen.",
          type: "error",
        });
      }

      return;
    }

    if (imageRemoved) {
      updateCurrent.mutate({
        ...values,
        image: null,
      });
      return;
    }

    updateCurrent.mutate(values);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-sm"
      >
        <div className="border-b border-border-default px-6 py-5">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            Editar perfil
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Actualizá tus datos personales.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            {preview ? (
              <button
                type="button"
                className="shrink-0 cursor-zoom-in rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setIsImageZoomed(true)}
                aria-label="Ampliar foto de perfil"
              >
                <Image
                  src={preview}
                  alt="Vista previa de la foto de perfil"
                  width={80}
                  height={80}
                  unoptimized={preview.startsWith("data:")}
                  onError={() => setPreview(null)}
                  className="size-20 rounded-xl object-cover"
                />
              </button>
            ) : (
              <div
                aria-hidden="true"
                className={`flex size-20 shrink-0 items-center justify-center rounded-xl font-heading text-2xl font-semibold ${originalAvatar.colorClass}`}
              >
                {avatar.initials}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-primary">
                Foto de perfil
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Cambiar foto
                </Button>

                {preview && (
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          disabled={isSaving}
                        >
                          <X size={16} />
                          Quitar foto
                        </Button>
                      }
                    />

                    <DialogContent className="max-w-110 overflow-hidden border bg-card p-0 text-card-foreground shadow-2xl sm:max-w-110">
                      <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-5.5 py-4.5">
                        <DialogTitle className="m-0 text-base font-bold tracking-tight">
                          Quitar foto de perfil
                        </DialogTitle>
                      </DialogHeader>

                      <div className="p-5.5">
                        <p className="text-sm text-muted-foreground">
                          ¿Seguro que querés quitar tu foto de perfil? Tendrás
                          que guardar los cambios para confirmar la eliminación.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5.5 py-3.5">
                        <DialogClose
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className="h-auto cursor-pointer rounded-full px-3.75 py-2 text-[13px] font-semibold"
                            >
                              Cancelar
                            </Button>
                          }
                        />

                        <DialogClose
                          render={
                            <Button
                              type="button"
                              disabled={isSaving}
                              className="h-auto cursor-pointer rounded-full bg-foreground px-4.25 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90"
                              onClick={handleRemoveImage}
                            >
                              Quitar foto
                            </Button>
                          }
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSaving}
              />

              <p className="text-xs text-text-tertiary">
                Imagen JPEG, PNG, WebP o GIF de hasta 4 MB. Podés quitarla para
                usar tus iniciales.
              </p>

              {imageError && (
                <p role="alert" className="text-xs text-destructive">
                  {imageError}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              autoComplete="given-name"
              disabled={isSaving}
              errorMessage={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-last-name">Apellido</Label>
            <Input
              id="profile-last-name"
              autoComplete="family-name"
              disabled={isSaving}
              errorMessage={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Correo electrónico</Label>
            <Input id="profile-email" value={user.email} disabled readOnly />
            <p className="text-xs text-text-tertiary">
              El correo electrónico no se puede modificar desde aquí.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-default px-6 py-4">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={isSaving}
                >
                  <X size={16} />
                  Cancelar
                </Button>
              }
            />

            <DialogContent className="max-w-110 overflow-hidden border bg-card p-0 text-card-foreground shadow-2xl sm:max-w-110">
              <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-5.5 py-4.5">
                <DialogTitle className="m-0 text-base font-bold tracking-tight">
                  Cancelar edición
                </DialogTitle>
              </DialogHeader>

              <div className="p-5.5">
                <p className="text-sm text-muted-foreground">
                  ¿Seguro que querés cancelar? Se perderán los cambios que no
                  hayas guardado.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5.5 py-3.5">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto cursor-pointer rounded-full px-3.75 py-2 text-[13px] font-semibold"
                    >
                      Seguir editando
                    </Button>
                  }
                />

                <Button
                  type="button"
                  onClick={onDone}
                  className="h-auto cursor-pointer rounded-full bg-foreground px-4.25 py-2 text-[13px] font-semibold text-background hover:bg-foreground/90"
                >
                  Descartar cambios
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button type="submit" className="cursor-pointer" disabled={isSaving}>
            <Check size={16} />
            {isUploading
              ? "Subiendo foto..."
              : isSaving
                ? "Guardando..."
                : "Guardar cambios"}
          </Button>
        </div>
      </form>

      {isImageZoomed && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Foto de perfil ampliada"
          onClick={() => setIsImageZoomed(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              className="absolute -right-3 -top-3 z-10 cursor-pointer rounded-full"
              aria-label="Cerrar imagen ampliada"
              onClick={() => setIsImageZoomed(false)}
            >
              <X size={18} />
            </Button>

            <Image
              src={preview}
              alt="Foto de perfil ampliada"
              width={800}
              height={800}
              unoptimized={preview.startsWith("data:")}
              onError={() => setIsImageZoomed(false)}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
