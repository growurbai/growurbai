"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type SmoothScrollLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

function getHashTarget(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return null;
  }
  return href.slice(hashIndex + 1);
}

export function SmoothScrollLink({ href, className, children, ...props }: SmoothScrollLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetId = getHashTarget(href);
    if (!targetId || pathname !== "/") {
      return;
    }

    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
