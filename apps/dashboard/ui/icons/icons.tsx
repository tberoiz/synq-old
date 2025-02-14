'use client'
import Image from "next/image";

export const SynqIcon = (props: React.ComponentProps<any>) => {
  return (
    <Image
      src="/brand/icon.png"
      alt="synq Icon"
      width={64}
      height={64}
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

export const ShopifyIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/shopify.svg"
    alt="Shopify Icon"
    width="16"
    height="16"
    className="w-4 h-4"
    {...props}
  />
);

export const TCGPlayerIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/tcgplayer.svg"
    alt="TCGPlayer Icon"
    width={16}
    height={16}
    className="w-4 h-4"
    {...props}
  />
);

export const GumroadIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/gumroad.svg"
    alt="Gumroad Icon"
    width={16}
    height={16}
    className="w-4 h-4"
    {...props}
  />
);

export const EtsyIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/etsy.svg"
    alt="Etsy Icon"
    width={16}
    height={16}
    className="w-4 h-4"
    {...props}
  />
);

export const CardMarketIcon = (props: React.ComponentProps<any>) => (
  <Image
    src="/icons/cardmarket.svg"
    alt="CardMarket Icon"
    width={16}
    height={16}
    className="w-4 h-4"
    {...props}
  />
);
