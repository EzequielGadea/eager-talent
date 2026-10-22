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
import { toast } from "~/components/ui/toast";
import getAvatar from "~/lib/avatar";
import { api } from "~/lib/trpc/react";
import { profileSchema, type ProfileFormData } from "~/lib/validations/profile";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

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
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, lastName: user.lastName },
  });

  const [name, lastName] = useWatch({ control, name: ["name", "lastName"] });
  const avatar = getAvatar(name ?? "", lastName ?? "");

  const updateCurrent = api.user.updateCurrent.useMutation({
    onError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
    onSuccess: () => {
      // Keep the edit screen visible until the refreshed data has streamed in.
      startTransition(() => {
        router.refresh();
        onDone();
      });
    },
  });

  const isSaving = updateCurrent.isPending || isTransitionPending;

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Seleccioná un archivo de imagen válido.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no puede superar los 5 MB.");
      return;
    }

    setImageError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function onSubmit(values: ProfileFormData) {
    // TODO(backend): if `imageFile` is set, upload it to UploadThing first
    // (e.g. `startUpload([imageFile])` from `useUploadThing`), take the
    // returned URL and send it together with the form values:
    //   updateCurrent.mutate({ ...values, image: uploadedUrl });
    // See the TODO block in `update-current.ts` for the server side.
    updateCurrent.mutate(values);
  }

  return (
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
            <Image
              src={preview}
              alt="Vista previa de la foto de perfil"
              width={80}
              height={80}
              unoptimized={preview.startsWith("data:")}
              className="size-20 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className={`flex size-20 shrink-0 items-center justify-center rounded-xl font-heading text-2xl font-semibold ${avatar.colorClass}`}
            >
              {avatar.initials}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">
              Foto de perfil
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} />
              Cambiar foto
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <p className="text-xs text-text-tertiary">Imagen de hasta 5 MB.</p>

            {imageError && (
              <p role="alert" className="text-xs text-destructive">
                {imageError}
              </p>
            )}

            {/* TODO(backend): remove this note once the upload is connected. */}
            {imageFile && (
              <p className="text-xs text-text-tertiary">
                La foto todavía no se guarda en el servidor.
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
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
