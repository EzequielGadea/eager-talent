"use client";

import Image from "next/image";
import { useState } from "react";

import { getSafeExternalUrl } from "../_lib/external-url";

type CandidateAvatarProps = {
  name: string;
  lastName: string;
  photo: string | null;
};

export function CandidateAvatar({
  name,
  lastName,
  photo,
}: CandidateAvatarProps) {
  const photoUrl = getSafeExternalUrl(photo);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const initials = `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${name} ${lastName}`;

  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-xl font-semibold text-emerald-700">
      {photoUrl && photoUrl !== failedPhoto ? (
        <Image
          src={photoUrl}
          alt={fullName}
          width={64}
          height={64}
          className="size-16 object-cover"
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
