import type { ReactNode } from "react";
import styles from "./account-layout.module.css";
export default function AccountPageHeader({ title, description, action }: { title:string; description:string; action?:ReactNode }) {
  return <header className={styles.header}><div><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}
