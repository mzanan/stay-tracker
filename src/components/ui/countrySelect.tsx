"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CountryOption } from "@/lib/countries";

interface CountrySelectProps {
  id: string;
  options: CountryOption[];
  value: string | null;
  onValueChange: (code: string) => void;
  placeholder: string;
  invalid?: boolean;
  className?: string;
}

export function CountrySelect({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  invalid = false,
  className,
}: CountrySelectProps) {
  const items = options.map((option) => ({ value: option.code, label: option.name }));
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(code) => {
        if (code) onValueChange(code);
      }}
    >
      <SelectTrigger id={id} size="lg" aria-invalid={invalid} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="min-h-11 text-base">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
