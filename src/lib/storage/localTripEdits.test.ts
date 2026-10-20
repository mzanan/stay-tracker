import { describe, expect, it } from "vitest";

import { MESSAGES } from "@/lib/constants/messages";
import { EMPTY_TRIPS, parseLocalTrips, type LocalTrips } from "@/lib/storage/localTrips";
import { addPassport, changePassport, removePassport, removeStay, saveStay } from "@/lib/storage/localTripEdits";

const ID_A = "00000000-0000-4000-8000-00000000000a";
const ID_B = "00000000-0000-4000-8000-00000000000b";
const ID_C = "00000000-0000-4000-8000-00000000000c";
const TODAY = "2026-10-20";

function unwrap(result: { ok: true; data: LocalTrips } | { ok: false; error: string }): LocalTrips {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

describe("local trip edits", () => {
  it("adds a passport once per country", () => {
    const trips = unwrap(addPassport(EMPTY_TRIPS, { country: "AR", expires_on: "" }, ID_A));
    expect(trips.passports).toEqual([{ id: ID_A, country: "AR", expires_on: null }]);
    expect(addPassport(trips, { country: "AR" }, ID_B)).toEqual({
      ok: false,
      error: MESSAGES.passportAlreadyAdded,
    });
  });

  it("adds, edits and removes a stay", () => {
    const added = unwrap(
      saveStay(EMPTY_TRIPS, { country: "ES", entry_date: "2026-10-01", exit_date: "" }, TODAY, ID_A),
    );
    expect(added.stays).toEqual([
      { id: ID_A, country: "ES", entry_date: "2026-10-01", exit_date: null, passport_id: null },
    ]);
    const edited = unwrap(
      saveStay(added, { country: "FR", entry_date: "2026-10-01", exit_date: "2026-10-05" }, TODAY, ID_B, ID_A),
    );
    expect(edited.stays).toEqual([
      { id: ID_A, country: "FR", entry_date: "2026-10-01", exit_date: "2026-10-05", passport_id: null },
    ]);
    expect(removeStay(edited, ID_A).stays).toEqual([]);
  });

  it("rejects overlapping stays with the shared message", () => {
    const trips = unwrap(
      saveStay(EMPTY_TRIPS, { country: "ES", entry_date: "2026-10-01", exit_date: "2026-10-10" }, TODAY, ID_A),
    );
    expect(
      saveStay(trips, { country: "FR", entry_date: "2026-10-05", exit_date: "2026-10-12" }, TODAY, ID_B),
    ).toEqual({ ok: false, error: MESSAGES.overlap("1 Oct 2026") });
  });

  it("rejects a trip after a stay that is still open", () => {
    const trips = unwrap(
      saveStay(EMPTY_TRIPS, { country: "IT", entry_date: "2026-10-01", exit_date: "" }, TODAY, ID_A),
    );
    expect(
      saveStay(trips, { country: "FR", entry_date: "2026-12-01", exit_date: "2026-12-10" }, TODAY, ID_B),
    ).toEqual({ ok: false, error: MESSAGES.openStay("Italy") });
  });

  it("rejects marking a trip that has not started as still there", () => {
    expect(
      saveStay(EMPTY_TRIPS, { country: "IT", entry_date: "2026-11-05", exit_date: "" }, TODAY, ID_A),
    ).toEqual({ ok: false, error: MESSAGES.stillThereNotStarted });
  });

  it("rejects trips more than a year ahead", () => {
    expect(
      saveStay(EMPTY_TRIPS, { country: "IT", entry_date: "2062-10-01", exit_date: "2062-10-05" }, TODAY, ID_A),
    ).toEqual({ ok: false, error: MESSAGES.tooFarAhead("20 Oct 2027") });
    expect(
      saveStay(EMPTY_TRIPS, { country: "IT", entry_date: "2027-10-01", exit_date: "2027-10-21" }, TODAY, ID_A),
    ).toEqual({ ok: false, error: MESSAGES.tooFarAhead("20 Oct 2027") });
    expect(
      saveStay(EMPTY_TRIPS, { country: "IT", entry_date: "2027-10-10", exit_date: "2027-10-20" }, TODAY, ID_A).ok,
    ).toBe(true);
  });

  it("rejects editing a stay that does not exist", () => {
    expect(
      saveStay(EMPTY_TRIPS, { country: "ES", entry_date: "2026-10-01" }, TODAY, ID_A, ID_C),
    ).toEqual({ ok: false, error: MESSAGES.stayNotFound });
  });

  it("clears the passport of stays when the passport is removed", () => {
    const trips: LocalTrips = {
      version: 1,
      passports: [
        { id: ID_A, country: "AR", expires_on: null },
        { id: ID_C, country: "BR", expires_on: null },
      ],
      stays: [{ id: ID_B, country: "ES", entry_date: "2026-10-01", exit_date: null, passport_id: ID_A }],
    };
    const result = unwrap(removePassport(trips, ID_A));
    expect(result.passports).toEqual([{ id: ID_C, country: "BR", expires_on: null }]);
    expect(result.stays[0].passport_id).toBeNull();
  });

  it("keeps the last passport while there are trips, and lets it go when there are none", () => {
    const withTrip = unwrap(
      saveStay(
        unwrap(addPassport(EMPTY_TRIPS, { country: "AR" }, ID_A)),
        { country: "ES", entry_date: "2026-10-01", exit_date: "2026-10-05" },
        TODAY,
        ID_B,
      ),
    );
    expect(removePassport(withTrip, ID_A)).toEqual({ ok: false, error: MESSAGES.lastPassportWithTrips });
    expect(unwrap(removePassport(removeStay(withTrip, ID_B), ID_A)).passports).toEqual([]);
  });

  it("changes a passport country and keeps its trips", () => {
    const trips = unwrap(
      saveStay(
        unwrap(addPassport(EMPTY_TRIPS, { country: "AR" }, ID_A)),
        { country: "ES", entry_date: "2026-10-01", exit_date: "2026-10-05" },
        TODAY,
        ID_B,
      ),
    );
    const changed = unwrap(changePassport(trips, ID_A, { country: "IT" }));
    expect(changed.passports).toEqual([{ id: ID_A, country: "IT", expires_on: null }]);
    expect(changed.stays).toEqual(trips.stays);
    expect(changePassport(trips, ID_C, { country: "IT" })).toEqual({
      ok: false,
      error: MESSAGES.passportNotFound,
    });
  });
});

describe("parseLocalTrips", () => {
  it("returns empty trips when nothing is stored", () => {
    expect(parseLocalTrips(null)).toEqual({ trips: EMPTY_TRIPS, complete: true });
  });

  it("flags unreadable data as incomplete", () => {
    expect(parseLocalTrips("{not json")).toEqual({ trips: EMPTY_TRIPS, complete: false });
    expect(parseLocalTrips(JSON.stringify({ version: 2, passports: [], stays: [] })).complete).toBe(false);
  });

  it("keeps the valid records when one record is broken", () => {
    const raw = JSON.stringify({
      version: 1,
      passports: [{ id: ID_A, country: "AR", expires_on: null }],
      stays: [
        { id: ID_B, country: "ES", entry_date: "2026-10-01", exit_date: null, passport_id: null },
        { id: "not-a-uuid", country: "FR", entry_date: "2026-09-01", exit_date: null },
      ],
    });
    const parsed = parseLocalTrips(raw);
    expect(parsed.complete).toBe(false);
    expect(parsed.trips.passports).toHaveLength(1);
    expect(parsed.trips.stays.map((stay) => stay.id)).toEqual([ID_B]);
  });
});
