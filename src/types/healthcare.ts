export interface PatientRecord {
  patientId: string;
  age: number;
  gender: 'Male' | 'Female';
  department: 'Dermatology' | 'Pediatrics' | 'Cardiology' | 'General Medicine' | 'Orthopedics' | 'Neurology';
  visitType: 'OPD' | 'IPD';
  admissionStatus: 'Admitted' | 'Not Admitted';
  diagnosis: string;
  doctor: string;
  treatmentCost: number;
  lengthOfStay: number;
  paymentMode: 'Insurance' | 'Credit Card' | 'Cash' | 'UPI';
  visitDate: string; // YYYY-MM-DD
  visitDateDisplay: string; // DD-MM-YYYY
  month: string; // Jan..Dec
  monthIndex: number; // 1..12
  ageGroup: '0-18' | '19-35' | '36-50' | '51-65' | '66+';
}

export interface FilterState {
  searchQuery: string;
  selectedDepartments: string[];
  selectedAdmissionStatuses: string[];
  selectedGenders: string[];
  selectedVisitTypes: string[];
  selectedPaymentModes: string[];
  selectedAgeGroups: string[];
  selectedDoctor: string;
  selectedDiagnosis: string;
  dateRange: [string, string]; // [minDate, maxDate]
}

export type ActivePage = 
  | 'overview' 
  | 'patients' 
  | 'performance' 
  | 'costs' 
  | 'trends' 
  | 'powerbi' 
  | 'about';
