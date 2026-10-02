"use client";

import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";
import { logoutAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending}>
      Keluar
    </Button>
  );
}

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}