import { PassportPicker } from "@/components/Tracker/PassportPicker";
import type { TrackerActions } from "@/components/Tracker/useTracker";
import { Title } from "@/components/ui/title";
import type { LocalPassport } from "@/lib/storage/localTrips";

interface AppHeaderProps {
  passports: LocalPassport[];
  actions: TrackerActions;
}

export function AppHeader({ passports, actions }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Title as="h2" size="md" className="shrink-0">
        Stay Tracker
      </Title>
      {passports.length > 0 && <PassportPicker passports={passports} actions={actions} />}
    </header>
  );
}
