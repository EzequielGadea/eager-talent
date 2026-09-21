"use client";

import Image from "next/image";
import { useState } from "react";

import { getSafeExternalUrl } from "../_lib/external-url";

type ApplicantAvatarProps = {
  name: string;
  lastName: string;
  photo: string | null;
};

export function ApplicantAvatar({
  name,
  lastName,
  photo,
}: ApplicantAvatarProps) {
  const photoUrl = getSafeExternalUrl(photo);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const initials = `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${name} ${lastName}`;

  return (
    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-tag-green-bg text-xl font-semibold text-tag-green-fg">
      {photoUrl && photoUrl !== failedPhoto ? (
        <Image
          src={photoUrl}
          alt={fullName}
          width={80}
          height={80}
          className="size-20 object-cover"
          unoptimized
          onError={() => setFailedPhoto(photoUrl)}
        />
      ) : (
        <span role="img" aria-label={fullName}>
          {initials}
        </span>
      )}
    </div>
  );
}
