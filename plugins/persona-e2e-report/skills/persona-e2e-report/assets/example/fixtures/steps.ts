import path from "node:path";
import { createStepScreenshots } from "../reporters/report-kit";

export const STORAGE_STATE = {
  applicant: path.join(__dirname, "../.auth/applicant.json"),
  approver: path.join(__dirname, "../.auth/approver.json"),
} as const;

export const steps = createStepScreenshots({
  projectName: "journeys",
  attachmentPrefix: "step",
  roleByStorageState: {
    [STORAGE_STATE.applicant]: "applicant",
    [STORAGE_STATE.approver]: "approver",
  },
});
