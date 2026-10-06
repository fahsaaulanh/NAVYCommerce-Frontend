"use client";

import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";
import { logoutAction } from "./actions";
import Icon from "@/components/ui/Icon";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} variant="ghost"
  icon={<Icon name="logout" />}>
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