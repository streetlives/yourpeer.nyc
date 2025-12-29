"use client";
import React from "react";
export function NoTranslate(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  return (
    <div
      translate="no"
      className={["notranslate", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
