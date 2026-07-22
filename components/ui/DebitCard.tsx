export default function DebitCard() {
  return (
    <div className="relative mt-4 overflow-hidden rounded-[10px] border border-white/10 bg-linear-to-br from-[#101d2c] via-[#0d1724] to-[#08111d] p-4 text-(--sidebar-text) shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      {/* Glow Effects */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-md bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-16 w-16 rounded-md bg-emerald-500/10 blur-2xl" />

      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-md">
            VISA
          </div>

          <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
            Virtual Card
          </div>
        </div>

        {/* CHIP */}
        <div className="relative h-10 w-14 overflow-hidden rounded-md border border-white/10 bg-linear-to-br from-white/20 to-white/5 backdrop-blur-md">
          <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
          <div className="absolute top-1/2 h-px w-full bg-white/10" />
        </div>
      </div>

      {/* NUMBER */}
      <div className="relative z-10 mt-8 flex items-center gap-3 text-[13px] font-bold tracking-[0.28em] text-white">
        <span>••••</span>
        <span>••••</span>
        <span>••••</span>
        <span>4242</span>
      </div>

      {/* Bottom */}
      <div className="relative z-10 mt-6 flex items-end justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
            Card Holder
          </div>

          <div className="mt-1 text-xs font-bold text-white">CyberLs ADMIN</div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-white/40">
            Expires
          </div>

          <div className="mt-1 text-xs font-bold text-white">12/28</div>
        </div>
      </div>

      {/* Circles */}
      <div className="absolute bottom-4 right-4 flex items-center">
        <div className="h-6 w-6 rounded-md bg-red-500/80 blur-[0.5px]" />
        <div className="-ml-2 h-6 w-6 rounded-md bg-yellow-400/80 blur-[0.5px]" />
      </div>
    </div>
  );
}
