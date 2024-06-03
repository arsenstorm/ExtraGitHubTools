"use client";

import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react'
import React from 'react'
import NextLink, { type LinkProps } from 'next/link'
import { useRouter } from "next/navigation";

export const Link = React.forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const router = useRouter();

  return (
    <HeadlessDataInteractive>
      <NextLink
        ref={ref}
        onMouseEnter={(e) => {
          const href = typeof props.href === "string" ? props.href : null;
          if (href) {
            router.prefetch(href);
          }
          return props.onMouseEnter?.(e);
        }}
        {...props}
      />
    </HeadlessDataInteractive>
  )
})
