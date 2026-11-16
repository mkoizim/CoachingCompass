import { cn } from '@/lib/utils';
import type { Stat } from '@/lib/types';

interface StatBarProps {
  stat: Stat | undefined;
  label: string;
  higherIsBetter?: boolean;
}

const getHSLColor = (percentile: number, higherIsBetter: boolean) => {
  // Baseball Savant style: High percentile (good) = Red, Low (bad) = Blue.
  const adjustedPercentile = higherIsBetter ? percentile : 100 - percentile;

  // Hue: 0 is Red, 240 is Blue.
  // We map 50-100 percentile to Hue 0 (Red) and 0-50 to Hue 240 (Blue)
  // The saturation will decrease as we approach the 50th percentile.
  const hue = adjustedPercentile >= 50 ? 0 : 240;

  // Saturation: 0 is grey, 100 is full color.
  // We want saturation to be highest at 0 and 100, and lowest at 50.
  const saturation = Math.abs(adjustedPercentile - 50) * 1.5; // Controls color intensity

  const lightness = 60; // A consistent lightness value

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function StatBar({ stat, label, higherIsBetter = true }: StatBarProps) {
  if (!stat || stat.value === undefined || stat.percentile === undefined) {
    return null;
  }
  const { value, percentile } = stat;
  const barColor = getHSLColor(percentile, higherIsBetter);

  const formattedValue = (val: number | undefined, label: string) => {
    if (val === undefined || val === null || isNaN(val)) return '-';
    if (label.includes('%') || label.includes('Rate')) return `${val.toFixed(1)}%`;
    if (label === 'xERA') return val.toFixed(2);
    if (label.includes('xwOBA') || label.includes('xBA') || label.includes('xSLG'))
      return val.toFixed(3);
    if (label.includes('Velo') || label.includes('Speed')) return `${val.toFixed(1)} mph`;
    if (label.includes('Spin')) return `${val.toFixed(0)} rpm`;
    if (label.includes('Strength')) return `${val.toFixed(1)} mph`;
    if (label === 'Arm Value') return val.toFixed(1);
    if (label === 'Range (OAA)') return val.toFixed(1);
    if (label === 'Framing Runs') return val.toFixed(1);
    if (label === 'Blocks Above Avg') return val.toFixed(1);
    if (label === 'CS Above Avg') return val.toFixed(1);
    if (label.includes('Run Value')) return val.toFixed(0);
    if (label === 'Extension') return `${val.toFixed(1)} ft`;
    return val.toString();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-28 text-sm text-right font-medium text-muted-foreground truncate">
        {label}
      </div>
      <div className="flex-1 flex items-center">
        <div className="w-full bg-muted rounded-full h-5 relative overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentile}%`, backgroundColor: barColor }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ color: percentile > 65 || percentile < 35 ? 'white' : 'black' }}
          >
            {percentile}
          </div>
        </div>
      </div>
      <div className="w-20 text-sm text-left font-mono">{formattedValue(value, label)}</div>
    </div>
  );
}
