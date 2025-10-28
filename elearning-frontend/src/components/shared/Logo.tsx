import React, { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Logo = (props: ComponentProps<"svg">) => {
  const { className, ...rest } = props;

  return (
    <svg
      fill="none"
      viewBox="0 0 40 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-12", className)}
      {...rest}
    >
      <g fill="currentColor">
        <path d="m0 14.5264v18.9473l17.8947-12.2437v-18.94741z" opacity=".5" />
        <path d="m0 33.4737v-18.9474l17.8947 12.2438v18.9474z" opacity=".5" />
        <path
          d="m40 14.5263v18.9474l-17.8947-12.2438v-18.94737z"
          opacity=".5"
        />
        <path d="m40 33.4737v-18.9474l-17.8947 12.2438v18.9474z" opacity=".5" />
      </g>
    </svg>
  );
};

export default Logo;
