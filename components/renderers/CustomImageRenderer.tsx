"use client";

import Image from "next/image";
import { useState } from "react";

function CustomImageRenderer({ data }: any) {
  const src = data.file.url;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full min-h-[15rem]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
        </div>
      )}
      <Image
        alt="image"
        className="object-contain"
        fill
        src={src}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
}

export default CustomImageRenderer;
