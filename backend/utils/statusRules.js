export const APPLICATION_STATUS = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  CANCELLED: "cancelled",
});

export const PLACEMENT_STATUS = Object.freeze({
  ACCEPTED: "accepted",
  IN_PROGRESS: "in progress",
  ACTIVE: "active",
  COMPLETED: "completed",
  COMPLETE: "complete",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
});

export const REPORT_STATUS = Object.freeze({
  SUBMITTED: "submitted",
  SIGNED: "signed",
  FACULTY_SUBMITTED: "faculty_submitted",
  APPROVED: "approved",
});

export const EVALUATION_STATUS = Object.freeze({
  SUBMITTED: "submitted",
});

export const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

export const isPendingApplication = (status) =>
  normalizeStatus(status) === APPLICATION_STATUS.PENDING;

export const isAcceptedApplication = (status) =>
  normalizeStatus(status) === APPLICATION_STATUS.ACCEPTED;

export const isCurrentPlacementStatus = (status) =>
  [
    PLACEMENT_STATUS.ACCEPTED,
    PLACEMENT_STATUS.IN_PROGRESS,
    PLACEMENT_STATUS.ACTIVE,
  ].includes(normalizeStatus(status));

export const isLockedPlacementStatus = (status) =>
  [
    PLACEMENT_STATUS.ACCEPTED,
    PLACEMENT_STATUS.IN_PROGRESS,
    PLACEMENT_STATUS.ACTIVE,
    PLACEMENT_STATUS.COMPLETED,
    PLACEMENT_STATUS.COMPLETE,
  ].includes(normalizeStatus(status));
