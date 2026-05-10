import { describe, test, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import { updateMedicationStock } from "../../../../src/utils/records/rollback/updateMedicationStock";
import { Medication } from "../../../../src/models/medications";

describe("updateMedicationStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Should increase medication stock", async () => {
    const saveMock = vi.fn();
    vi.spyOn(Medication, "findById").mockResolvedValueOnce({
      stockDisponible: 5,
      save: saveMock,
    } as any);
    await updateMedicationStock(
      [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 2,
        },
      ],
      1,
    );
    expect(saveMock).toHaveBeenCalled();
  });

  test("Should decrease medication stock", async () => {
    const saveMock = vi.fn();
    vi.spyOn(Medication, "findById").mockResolvedValueOnce({
      stockDisponible: 10,
      save: saveMock,
    } as any);
    await updateMedicationStock(
      [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 3,
        },
      ],
      -1,
    );
    expect(saveMock).toHaveBeenCalled();
  });

  test("Should execute medication not found branch", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.spyOn(Medication, "findById").mockResolvedValueOnce(null);
    await updateMedicationStock(
      [
        {
          medication: new mongoose.Types.ObjectId(),
          units: 1,
        },
      ],
      1,
    );
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});