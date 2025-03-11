"use client";

import Image from "next/image";

export const SynqIcon = (props: React.ComponentProps<any>) => {
  return (
    <Image
      src="/brand/synq-icon.png"
      alt="synq Icon"
      width={42}
      height={42}
      {...props}
    />
  );
};

export const EbayIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/ebay.svg"
    alt="Ebay Icon"
    width={16}
    height={16}
    className="w-4 h-4"
    sizes="(max-width: 768px) 16px, 16px"
    {...props}
  />
);
