import type { MemeTemplateTextAnchor } from '@/types/meme';

interface MemeTextInputProps {
  anchor: MemeTemplateTextAnchor;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function MemeTextInput({
  anchor,
  value,
  onChange,
  maxLength = 100,
}: MemeTextInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-tg-text block font-medium">{anchor.label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={`Enter text for ${anchor.label}`}
        className="bg-tg-section-bg text-tg-text border-tg-section-separator placeholder:text-tg-hint w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tg-button"
      />
      <div className="flex items-center justify-between">
        <p className="text-tg-hint text-xs">
          Position: {anchor.anchor_index + 1}
        </p>
        <p className="text-tg-hint text-xs text-right">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
