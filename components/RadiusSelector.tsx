
"use client";

import { RADIUS_OPTIONS_KM } from "@/lib/categories";

type Props = {
  value: number;
  onChange: (km: number) => void;
};

export default function RadiusSelector({ value, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Search radius"
      className="flex flex-wrap gap-2"
    >
      {RADIUS_OPTIONS_KM.map((km) => {
        const selected = km === value;

        return (
          <button
            key={km}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(km)}
            className={`rounded-full border px-4 py-2 text-sm ${
              selected
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {km} km
          </button>
        );
      })}
    </div>
  );
}
