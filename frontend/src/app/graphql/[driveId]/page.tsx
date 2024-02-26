"use client";
import GraphQLIframe from "@/components/graphql/iframe";
import { useParams } from "next/navigation";
import { Suspense } from "react";

export default function GraphQLDrive() {
  const params = useParams<{ driveId: string }>();

  return (
    <Suspense>
      <GraphQLIframe
        url={`${process.env.NEXT_PUBLIC_SWITCHBOARD_HOST}/explorer/${params?.driveId}`}
      />
    </Suspense>
  );
}
