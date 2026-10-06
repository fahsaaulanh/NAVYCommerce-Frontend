"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { createStoreAction } from "./actions";
import type { CreateStoreState } from "./types";

const initialState: CreateStoreState = {};

function suggestSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

export default function CreateStoreForm() {
  const [state, formAction, pending] = useActionState(
    createStoreAction,
    initialState,
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <form action={formAction} aria-busy={pending}>
      {state.message && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm leading-6 text-danger"
        >
          {state.message}
        </div>
      )}

      <fieldset disabled={pending} className="space-y-6">
        <legend className="sr-only">Informasi toko baru</legend>

        <div>
          <FormField
            id="store-name"
            name="name"
            label="Nama toko"
            placeholder="Contoh: NAVY Fashion"
            required
            minLength={2}
            maxLength={150}
            value={name}
            onChange={event => {
              const value = event.target.value;
              setName(value);

              if (!slugEdited) {
                setSlug(suggestSlug(value));
              }
            }}
            aria-invalid={Boolean(state.errors?.name)}
            aria-describedby={
              state.errors?.name ? "store-name-error" : undefined
            }
          />

          {state.errors?.name && (
            <p
              id="store-name-error"
              className="mt-2 text-xs leading-5 text-danger"
            >
              {state.errors.name}
            </p>
          )}
        </div>

        <div>
          <FormField
            id="store-slug"
            name="slug"
            label="Slug toko"
            placeholder="navy-fashion"
            required
            maxLength={160}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={slug}
            onChange={event => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            hint="Identitas alamat toko. Contoh: navy-fashion. Slug harus unik."
            aria-invalid={Boolean(state.errors?.slug)}
            aria-describedby={
              state.errors?.slug ? "store-slug-error" : undefined
            }
          />

          {state.errors?.slug && (
            <p
              id="store-slug-error"
              className="mt-2 text-xs leading-5 text-danger"
            >
              {state.errors.slug}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="store-description"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Deskripsi{" "}
            <span className="font-normal text-muted">
              (opsional)
            </span>
          </label>

          <textarea
            id="store-description"
            name="description"
            rows={5}
            maxLength={2000}
            value={description}
            onChange={event =>
              setDescription(event.target.value)
            }
            placeholder="Ceritakan produk dan karakter tokomu."
            aria-invalid={Boolean(state.errors?.description)}
            aria-describedby={
              state.errors?.description
                ? "store-description-error"
                : undefined
            }
            className="w-full resize-y rounded-2xl border border-border bg-background/70 px-4 py-3 text-base text-foreground transition-colors placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />

          {state.errors?.description && (
            <p
              id="store-description-error"
              className="mt-2 text-xs leading-5 text-danger"
            >
              {state.errors.description}
            </p>
          )}
        </div>

        <Button
          type="submit"
          loading={pending}
          className="w-full"
        >
          Buat toko
        </Button>
      </fieldset>

      <div className="mt-5 text-center">
        {pending ? (
          <span className="text-sm text-muted">
            Sedang menyimpan toko…
          </span>
        ) : (
          <Link
            href="/seller/stores"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Kembali ke daftar toko
          </Link>
        )}
      </div>
    </form>
  );
}