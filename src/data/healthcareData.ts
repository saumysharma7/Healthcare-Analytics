import rawData from './healthcareData.json';
import { PatientRecord, FilterState } from '../types/healthcare';

export const HEALTHCARE_RECORDS: PatientRecord[] = rawData as PatientRecord[];

export const DEPARTMENTS = [
  'Dermatology',
  'Pediatrics',
  'Cardiology',
  'General Medicine',
  'Orthopedics',
  'Neurology'
] as const;

export const DOCTORS = [
  'Dr. Shah',
  'Dr. Singh',
  'Dr. Sharma',
  'Dr. Pawar',
  'Dr. Rao',
  'Dr. Verma',
  'Dr. Deshmukh',
  'Dr. Joshi',
  'Dr. Kulkarni',
  'Dr. Gupta',
  'Dr. Khan',
  'Dr. More',
  'Dr. Chavan',
  'Dr. Iyer',
  'Dr. Patil',
  'Dr. Kapoor',
  'Dr. Mehta',
  'Dr. Nair'
] as const;

export const AGE_GROUPS = ['0-18', '19-35', '36-50', '51-65', '66+'] as const;

export const PAYMENT_MODES = ['Insurance', 'Cash', 'Credit Card', 'UPI'] as const;

export const VISIT_TYPES = ['OPD', 'IPD'] as const;

export const ADMISSION_STATUSES = ['Admitted', 'Not Admitted'] as const;

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedDepartments: [],
  selectedAdmissionStatuses: [],
  selectedGenders: [],
  selectedVisitTypes: [],
  selectedPaymentModes: [],
  selectedAgeGroups: [],
  selectedDoctor: '',
  selectedDiagnosis: '',
  dateRange: ['2025-01-02', '2025-12-31']
};

/**
 * Currency formatter conforming to Indian Numbering System (Lakhs & Crores)
 */
export function formatINR(val: number, options: { compact?: boolean; hideSymbol?: boolean } = {}): string {
  if (isNaN(val)) return '₹0';
  const prefix = options.hideSymbol ? '' : '₹';
  
  if (options.compact) {
    if (Math.abs(val) >= 10000000) {
      return `${prefix}${(val / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `${prefix}${(val / 100000).toFixed(2)} L`;
    }
    if (Math.abs(val) >= 1000) {
      return `${prefix}${(val / 1000).toFixed(1)}k`;
    }
  }

  // Exact standard Indian comma separation: ₹1,52,21,509
  const isNeg = val < 0;
  const abs = Math.abs(Math.round(val));
  const str = abs.toString();
  let result = '';
  
  if (str.length > 3) {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    result = str;
  }
  
  return (isNeg ? '-' : '') + prefix + result;
}

/**
 * Filter dataset by arbitrary FilterState
 */
export function filterRecords(records: PatientRecord[], filters: FilterState): PatientRecord[] {
  return records.filter(record => {
    // Search query matches ID, diagnosis, doctor, or department
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match = 
        record.patientId.toLowerCase().includes(q) ||
        record.diagnosis.toLowerCase().includes(q) ||
        record.doctor.toLowerCase().includes(q) ||
        record.department.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.selectedDepartments.length > 0 && !filters.selectedDepartments.includes(record.department)) {
      return false;
    }

    if (filters.selectedAdmissionStatuses.length > 0 && !filters.selectedAdmissionStatuses.includes(record.admissionStatus)) {
      return false;
    }

    if (filters.selectedGenders.length > 0 && !filters.selectedGenders.includes(record.gender)) {
      return false;
    }

    if (filters.selectedVisitTypes.length > 0 && !filters.selectedVisitTypes.includes(record.visitType)) {
      return false;
    }

    if (filters.selectedPaymentModes.length > 0 && !filters.selectedPaymentModes.includes(record.paymentMode)) {
      return false;
    }

    if (filters.selectedAgeGroups.length > 0 && !filters.selectedAgeGroups.includes(record.ageGroup)) {
      return false;
    }

    if (filters.selectedDoctor && record.doctor !== filters.selectedDoctor) {
      return false;
    }

    if (filters.selectedDiagnosis && record.diagnosis !== filters.selectedDiagnosis) {
      return false;
    }

    if (filters.dateRange[0] && record.visitDate < filters.dateRange[0]) {
      return false;
    }

    if (filters.dateRange[1] && record.visitDate > filters.dateRange[1]) {
      return false;
    }

    return true;
  });
}

/**
 * Compute summary KPIs from filtered dataset
 */
export function computeKPIs(records: PatientRecord[]) {
  const totalPatients = records.length;
  const totalAdmissions = records.filter(r => r.admissionStatus === 'Admitted').length;
  const totalCost = records.reduce((sum, r) => sum + r.treatmentCost, 0);
  const avgCost = totalPatients > 0 ? Math.round(totalCost / totalPatients) : 0;
  const totalStay = records.reduce((sum, r) => sum + r.lengthOfStay, 0);
  const avgStay = totalPatients > 0 ? Number((totalStay / totalPatients).toFixed(2)) : 0;
  const totalAge = records.reduce((sum, r) => sum + r.age, 0);
  const avgAge = totalPatients > 0 ? Math.round(totalAge / totalPatients) : 0;

  const admissionRate = totalPatients > 0 ? Number(((totalAdmissions / totalPatients) * 100).toFixed(1)) : 0;

  return {
    totalPatients,
    totalVisits: totalPatients,
    totalAdmissions,
    totalCost,
    avgCost,
    avgStay,
    avgAge,
    admissionRate
  };
}
