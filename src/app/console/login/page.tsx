import { Suspense } from "react";
import { LoginClient } from "./ui";

export default async function ConsoleLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <Suspense>
      <LoginClient nextPath={next ?? "/console"} />
    </Suspense>
  );
}

