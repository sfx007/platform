"use client";

import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

/**
 * Avatar component that handles both regular URLs and base64 data URLs.
 * Uses <img> for data URLs (can't go through Next.js image optimization),
 * and next/image for normal paths/URLs.
 */
export default function Avatar({ src, alt, size, className = "" }: AvatarProps) {
  const imgSrc = src || "/img/new_boots_profile.webp";
  const isDataUrl = imgSrc.startsWith("data:");

  if (isDataUrl) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      suppressHydrationWarning
    />
  );
}
