export type UserRole = "ADMIN" | "STUDENT";
export type AttendanceStatus = "PRESENT" | "ABSENT";
export type PaymentType = "MONTHLY" | "CLASS";
export type PaymentMethod = "CASH" | "ONLINE";
export type PaymentStatus = "PAID" | "PENDING";
export type ClassType = "ONLINE" | "OFFLINE";
export type ScheduleDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type ClassStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type EnrollmentRequestStatus = "REQUESTED" | "PAYMENT_SUBMITTED" | "APPROVED" | "REJECTED";
export type HomeworkSubmissionStatus = "PENDING" | "SUBMITTED" | "REVIEWED";
export type MaterialCategory = "WORKSHEET" | "STORY" | "VIDEO";

export type StudentOption = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  qrCode: string;
};

export type TeacherOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type StudentItem = StudentOption & {
  parentName: string;
  parentContact?: string | null;
  grade?: string | null;
  school?: string | null;
  learningLevel?: string | null;
  notes?: string | null;
  createdAt: string;
  qrPreview: string;
  attendanceCount: number;
  paidTotal: number;
  pendingTotal: number;
  classCount: number;
  latestProgressMonth?: string | null;
};

export type AttendanceItem = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  createdAt: string;
};

export type PaymentItem = {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
};

export type ClassItem = {
  id: string;
  title: string;
  subject: string;
  level: string;
  type: ClassType;
  status: ClassStatus;
  date: string;
  scheduleDay: ScheduleDay;
  startTime: string;
  endTime: string;
  meetingLink?: string | null;
  location?: string | null;
  capacity: number;
  fee: number;
  notes?: string | null;
  teacher: TeacherOption;
  studentIds: string[];
  students: StudentOption[];
};

export type ClassEnrollmentRequestItem = {
  id: string;
  classId: string;
  className: string;
  classSubject: string;
  classLevel: string;
  classFee: number;
  classDate: string;
  scheduleDay: ScheduleDay;
  startTime: string;
  endTime: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string | null;
  parentName: string;
  parentContact?: string | null;
  grade?: string | null;
  school?: string | null;
  learningLevel?: string | null;
  notes?: string | null;
  status: EnrollmentRequestStatus;
  paymentSlipName?: string | null;
  paymentSlipUrl?: string | null;
  reviewNote?: string | null;
  approvedStudentId?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  approvedAt?: string | null;
};

export type ProgressItem = {
  id: string;
  studentId: string;
  studentName: string;
  month: string;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  comment?: string | null;
  testMark?: number | null;
  createdAt: string;
};

export type HomeworkSubmissionItem = {
  id: string;
  studentId: string;
  studentName: string;
  status: HomeworkSubmissionStatus;
  responseName?: string | null;
  responseUrl?: string | null;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

export type HomeworkItem = {
  id: string;
  title: string;
  description?: string | null;
  deadline: string;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  classId: string;
  className: string;
  createdAt: string;
  submissions: HomeworkSubmissionItem[];
};

export type MaterialItem = {
  id: string;
  title: string;
  category: MaterialCategory;
  description?: string | null;
  fileName: string;
  fileUrl: string;
  createdAt: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export type StudentProfile = {
  student: StudentItem;
  classes: ClassItem[];
  progress: ProgressItem[];
  homework: HomeworkItem[];
  attendance: AttendanceItem[];
  payments: PaymentItem[];
};

export type QuestionItem = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number;
};

export type QuizResultItem = {
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
};

export type QuizItem = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  questionCount: number;
  attemptCount: number;
  averageScore: number;
  questions?: QuestionItem[];
  results?: QuizResultItem[];
  result?: QuizResultItem | null;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: "emerald" | "amber" | "sky";
};
