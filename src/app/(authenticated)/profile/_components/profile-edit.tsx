"use client";

import Image from "next/image";
import { type ChangeEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Check, Eye, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/toast";
import getAvatar from "~/lib/avatar";
import { api } from "~/lib/trpc/react";
import { useUploadThing } from "~/lib/uploadthing";
import { profileSchema, type ProfileFormData } from "~/lib/validations/profile";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

type ProfileEditProps = {
  user: {
    name: string;
    lastName: string;
    email: string;
    image: string | null;
  };
  onDone: () => void;
};

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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Seleccioná un archivo de imagen válido.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no puede superar los 4 MB.");
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImageRemoved(false);

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
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Cambiar foto
                </Button>

                {preview && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={handleRemoveImage}
                  >
                    <X size={16} />
                    Quitar foto
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSaving}
              />

              <p className="text-xs text-text-tertiary">
                Imagen de hasta 4 MB. Podés quitarla para usar tus iniciales.
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
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={isSaving}
          >
            <X size={16} />
            Cancelar
          </Button>

          <Button type="submit" disabled={isSaving}>
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
              className="absolute -right-3 -top-3 z-10 rounded-full"
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
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
