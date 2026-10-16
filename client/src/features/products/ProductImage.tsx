import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  className = "",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const showPlaceholder = !src || hasError;

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

