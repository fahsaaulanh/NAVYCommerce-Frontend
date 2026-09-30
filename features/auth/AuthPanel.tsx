export default function AuthPanel() {
  return (
    <aside aria-label="Tentang NAVYCommerce" className="relative hidden overflow-hidden bg-panel p-10 text-on-panel lg:flex lg:flex-col lg:justify-between xl:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-24 size-80 rounded-full bg-brand-end/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.2em] text-panel-muted">TEMUKAN. TERHUBUNG. TUMBUH.</p>
        <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
          Pilihan baru.<br />Peluang baru.<br />
          <span className="bg-linear-to-r from-brand-start to-brand-end bg-clip-text text-transparent">Satu tempat.</span>
        </h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-panel-muted">Temukan produk pilihan atau mulai langkah baru sebagai merchant bersama NAVYCommerce.</p>
      </div>
      <div aria-hidden="true" className="relative my-10 h-36">
        <div className="absolute left-3 top-3 h-28 w-44 -rotate-12 rounded-3xl border border-on-panel/15 bg-on-panel/5" />
        <div className="absolute left-14 top-0 flex h-28 w-44 rotate-6 flex-col justify-between rounded-3xl border border-on-panel/20 bg-linear-to-br from-brand-start/30 to-brand-end/10 p-5">
          <span className="h-2 w-16 rounded-full bg-on-panel/60" />
          <div className="flex items-end justify-between"><span className="size-9 rounded-xl bg-accent/80" /><span className="h-2 w-12 rounded-full bg-brand-end/60" /></div>
        </div>
      </div>
      <div className="relative border-t border-on-panel/15 pt-6">
        <p className="text-sm font-medium">Untuk pembeli dan pemilik usaha.</p>
        <p className="mt-2 text-xs leading-6 text-panel-muted">Satu akun untuk memulai perjalananmu.</p>
      </div>
    </aside>
  );
}
