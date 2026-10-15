"use client";

import Image from "next/image";

import { useState } from "react";

import { getSafeExternalUrl } from "../_lib/external-url";

import getAvatar from "~/lib/avatar";

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
  const avatar = getAvatar(name, lastName);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const fullName = `${name} ${lastName}`;

  return (
    <div
      className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ${avatar.colorClass} text-xl font-semibold`}
    >
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
          {avatar.initials}
        </span>
      )}
    </div>
  );
}
