import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
  className?: string;
  logoClassName?: string;
  size?: number;
};

export function BrandMark({
  href = "/",
  label = "ARTEMSI",
  className = "",
  logoClassName = "brand-logo",
  size = 32,
}: Props) {
  const inner = (
    <>
      <Image
        src="/artemsi-logo.png"
        alt=""
        width={size}
        height={size}
        className={logoClassName}
        priority
      />
      <span className="brand-name">{label}</span>
    </>
  );

  if (!href) {
    return <div className={`brand-link ${className}`.trim()}>{inner}</div>;
  }

  return (
    <Link
      href={href}
      className={`brand-link ${className}`.trim()}
      aria-label={`Accueil ${label}`}
    >
      {inner}
    </Link>
  );
}
