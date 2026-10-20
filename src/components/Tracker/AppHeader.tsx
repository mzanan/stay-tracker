import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { PassportPicker } from "@/components/Tracker/PassportPicker";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import { Title } from "@/components/ui/title";
import type { LocalPassport } from "@/lib/storage/localTrips";

interface AppHeaderProps {
  passports: LocalPassport[];
  lastPassportLocked: boolean;
  actions: TrackerActions;
}

export function AppHeader({ passports, lastPassportLocked, actions }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Title as="h2" size="md" className="shrink-0">
        Stay Tracker
      </Title>
      <div className="flex min-w-0 items-center gap-1">
        {passports.length > 0 && (
          <PassportPicker passports={passports} locked={lastPassportLocked} actions={actions} />
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
