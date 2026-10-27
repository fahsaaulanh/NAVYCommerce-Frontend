import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
type Props = { title:string; description:string; action?:ReactNode; children:ReactNode; form?:boolean };
export default function AddressPageShell({ title, description, action, children, form=false }: Props) {
  return <section><AccountPageHeader title={title} description={description}
    action={action ?? (form ? <Link href="/account/addresses" className="action-button action-button--outline action-button--sm"><Icon name="arrow-left" />Daftar alamat</Link> : undefined)} />
    {children}
  </section>;
}
