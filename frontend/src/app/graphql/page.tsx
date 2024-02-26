"use client";
import GraphQLIframe from "@/components/graphql/iframe";
import { Suspense } from "react";

export default function GraphQL() {
  return (
    <Suspense>
      <GraphQLIframe
        url={`${process.env.NEXT_PUBLIC_SWITCHBOARD_HOST}/explorer`}
      />
    </Suspense>
  );
}
