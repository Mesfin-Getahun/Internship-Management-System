import { apiRequest } from "./apiClient";

export function getStudentInternships() {
  return apiRequest("/api/student/internships", {
    requiresAuth: true,
  });
}

export function getMyInternship() {
  return apiRequest("/api/student/myInternship", {
    requiresAuth: true,
  });
}

export function updateStudentProfile(profile) {
  return apiRequest("/api/student/updateProfile", {
    method: "PUT",
    body: profile,
    requiresAuth: true,
  });
}

export function getPaymentApplication() {
  return apiRequest("/api/student/paymentApplication", {
    requiresAuth: true,
  });
}

export function getStudentFeedbacks() {
  return apiRequest("/api/student/viewFeedbacks", {
    requiresAuth: true,
  });
}

export function cancelStudentApplication(applicationId) {
  return apiRequest(`/api/student/cancelApplication/${applicationId}`, {
    method: "DELETE",
    requiresAuth: true,
  });
}

export function submitSignedReportToFaculty(reportId) {
  return apiRequest(`/api/student/submitToFaculty/${reportId}`, {
    method: "PUT",
    requiresAuth: true,
  });
}

export function applyForInternship(internshipId, formData) {
  return apiRequest(`/api/student/applyInternship/${internshipId}`, {
    method: "POST",
    body: formData,
    isFormData: true,
    requiresAuth: true,
  });
}

export function uploadInternshipReport(internshipId, formData) {
  return apiRequest(`/api/student/uploadReport/${internshipId}`, {
    method: "POST",
    body: formData,
    isFormData: true,
    requiresAuth: true,
  });
}

export function submitPaymentForm(formData) {
  return apiRequest("/api/student/paymentApplication", {
    method: "POST",
    body: formData,
    isFormData: true,
    requiresAuth: true,
  });
}
