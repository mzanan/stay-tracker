import { formatFullDay } from "@/lib/formatDate";
import { SCHENGEN_RULE, SCHENGEN_RULE_TITLE } from "@/lib/rules/schengen";

export function RuleSourceLine() {
  const { url, verifiedAt } = SCHENGEN_RULE.source;
  return (
    <p className="border-t border-border pt-3 text-xs text-muted-foreground">
      Rule:{" "}
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
        {SCHENGEN_RULE_TITLE}
      </a>
      {verifiedAt && <> · verified {formatFullDay(verifiedAt)}</>} · not legal advice
    </p>
  );
}
