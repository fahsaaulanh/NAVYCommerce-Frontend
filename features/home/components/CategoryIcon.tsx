const shapes = [
  { pattern:/jam|watch/i, path:"M8 7V2h8v5M8 17v5h8v-5M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM12 8v4l2 1" },
  { pattern:/otomotif|automotive|kendaraan/i, path:"m4 10 2-5h12l2 5M3 10h18v9H3v-9ZM6 19v2M18 19v2M6 14h2M16 14h2" },
  { pattern:/hobi|mainan|toy|koleksi/i, path:"M4 8h5V5a3 3 0 1 1 6 0v3h5v5h-3a3 3 0 1 0 0 6h3v3H4v-5h3a3 3 0 1 0 0-6H4V8Z" },
  { pattern:/ibu|baby|bayi/i, path:"M9 5h6v4l3 4v7H6v-7l3-4V5ZM10 5V2h4v3M6 15h12M12 18h3" },
  { pattern:/elektr|electro|gadget|handphone|computer|komputer|laptop/i, path:"M4 4h16v12H4zM2 20h20M9 16v4M15 16v4" },
  { pattern:/pakaian|fashion|clothing|baju|busana/i, path:"m8 3-5 3 3 5 2-1v11h8V10l2 1 3-5-5-3a4 4 0 0 1-8 0Z" },
  { pattern:/sepatu|shoe|footwear/i, path:"M3 14V8h5l3 5 9 3v4H3v-6ZM11 13l2-2M14 14l2-2M3 17h18" },
  { pattern:/tas|bag|aksesor|accessor/i, path:"M5 8h14l1 13H4L5 8ZM8 8V6a4 4 0 0 1 8 0v2" },
  { pattern:/bunga|flower|gift|hadiah/i, path:"M12 12c-9 0-8-8-3-6 0-6 6-6 6 0 5-2 6 6-3 6ZM12 12v9M12 17c-5 0-6-3-6-3 5 0 6 3 6 3ZM12 19c5 0 6-3 6-3-5 0-6 3-6 3Z" },
  { pattern:/makan|minum|food|drink/i, path:"M5 3v7M8 3v7M11 3v7M5 7h6M8 10v11M18 3c-4 4-4 9 0 9V3ZM18 12v9" },
  { pattern:/buku|book|alat tulis/i, path:"M12 5C7 2 3 4 3 4v15s4-2 9 1c5-3 9-1 9-1V4s-4-2-9 1ZM12 5v15" },
  { pattern:/rumah|home|furniture|perabot/i, path:"m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" },
  { pattern:/cantik|beauty|health|sehat|perawatan/i, path:"M8 7h8v14H8V7ZM10 7V3h4v4M10 14h4M12 12v4" },
  { pattern:/olahraga|sport/i, path:"M2 9v6M5 6v12M19 6v12M22 9v6M5 12h14" },
];
export default function CategoryIcon({ name }: { name:string }) {
  const shape = shapes.find(item => item.pattern.test(name));
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={shape?.path ?? "m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9"} /></svg>;
}
