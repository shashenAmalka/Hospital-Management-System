/**
 * API Migration Helper
 * 
 * This file serves as a bridge between the old API utilities (api.js and requests.js)
 * and the new unified apiService. It re-exports the apiServices with the same interface
 * as the old utilities to minimize disruption during migration.
 */

import { apiServices } from './apiService';
import api from './apiService';

// Re-export for direct axios usage
export default api;

// Export the apiServices object for organized API calls
export const services = apiServices;

// Legacy exports from api.js
export const appointmentService = {
  getAll: apiServices.appointments.getAll,
  getById: apiServices.appointments.getById,
  create: apiServices.appointments.create,
  update: apiServices.appointments.update,
  delete: apiServices.appointments.delete,
  cancel: apiServices.appointments.cancel
};

export const labService = {
  getLabRequests: apiServices.labRequests.getAll,
  getPatientLabRequests: apiServices.labRequests.getPatientRequests,
  getLabRequestById: apiServices.labRequests.getById,
  createLabRequest: apiServices.labRequests.create,
  updateLabRequest: apiServices.labRequests.update,
  deleteLabRequest: apiServices.labRequests.delete,
  getLabReports: apiServices.labReports.getAll,
  getLabReportByRequestId: apiServices.labReports.getByLabRequestId,
  createLabReport: apiServices.labReports.create,
  updateLabReport: apiServices.labReports.update
};

export const patientService = {
  getProfile: apiServices.patients.getProfile,
  updateProfile: apiServices.patients.updateProfile
};

// Legacy export from requests.js
export const requests = {
  // Auth methods
  auth: {
    login: apiServices.auth.login,
    register: apiServices.auth.register,
    validateToken: apiServices.auth.validateToken
  },
  
  // Lab request methods
  labRequests: {
    getAll: apiServices.labRequests.getAll,
    getPatientRequests: apiServices.labRequests.getPatientRequests,
    getById: apiServices.labRequests.getById,
    create: apiServices.labRequests.create,
    update: apiServices.labRequests.update,
    delete: apiServices.labRequests.delete
  },
  
  // Lab reports methods
  labReports: {
    getAll: apiServices.labReports.getAll,
    getByLabRequestId: apiServices.labReports.getByLabRequestId,
    getById: apiServices.labReports.getById,
    create: apiServices.labReports.create,
    update: apiServices.labReports.update,
    delete: apiServices.labReports.delete
  },
  
  // Appointment methods
  appointments: {
    getAll: apiServices.appointments.getAll,
    getUserAppointments: apiServices.appointments.getUserAppointments,
    create: apiServices.appointments.create,
    update: apiServices.appointments.update,
    cancel: apiServices.appointments.cancel
  },
  
  // User/patient methods
  patients: {
    getProfile: apiServices.patients.getProfile,
    updateProfile: apiServices.patients.updateProfile
  }
};

// Helper functions that might be imported directly
export const getAuthToken = () => localStorage.getItem('token');
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});