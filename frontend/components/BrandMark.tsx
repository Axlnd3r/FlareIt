import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
  decorative?: boolean;
};

export function BrandMark({ className = "", priority = false, decorative = false }: BrandMarkProps) {
  return (
    <Image
      src="/brand/flareit-mark.png"
      alt={decorative ? "" : "FlareIt"}
      width={1254}
      height={1254}
      priority={priority}
      aria-hidden={decorative || undefined}
      className={className}
    />
  );
}
