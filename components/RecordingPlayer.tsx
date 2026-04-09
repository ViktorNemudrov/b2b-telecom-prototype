"use client";

import * as React from "react";
import { Download, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

const speeds = [0.5, 1, 1.5, 2] as const;

export function RecordingPlayer({
  src,
  fileName = "recording.mp3",
  className
}: {
  src: string;
  fileName?: string;
  className?: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const [dur, setDur] = React.useState(0);
  const [speed, setSpeed] = React.useState<(typeof speeds)[number]>(1);

  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setT(a.currentTime || 0);
    const onMeta = () => setDur(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
  }, [speed]);

  const pct = dur > 0 ? Math.min(1, t / dur) : 0;
  const mmss = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${String(ss).padStart(2, "0")}`;
  };

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-3 shadow-soft", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-2xl"
            onClick={() => {
              const a = audioRef.current;
              if (!a) return;
              if (a.paused) void a.play();
              else a.pause();
            }}
            aria-label={playing ? "Пауза" : "Воспроизвести"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-2xl"
            onClick={() => {
              const a = audioRef.current;
              if (!a) return;
              a.currentTime = 0;
            }}
            aria-label="Сначала"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "h-10 rounded-2xl border px-3 text-xs font-semibold transition active:translate-y-[1px]",
                s === speed
                  ? "border-transparent bg-gradient-to-r from-accent-teal to-accent-violet text-white shadow-softSm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {s}x
            </button>
          ))}
          <a
            href={src}
            download={fileName}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-softSm transition hover:bg-slate-50 active:translate-y-[1px]"
            aria-label="Скачать"
            title="Скачать"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{mmss(t)}</span>
          <span>{dur ? mmss(dur) : "—:—"}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-gradient-to-r from-accent-teal to-accent-violet" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

