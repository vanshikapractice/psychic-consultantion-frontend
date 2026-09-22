export type Role = "customer" | "psychic" | "admin";

export interface RoleRecord {
  id: number;
  name: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
  roleId?: number;
  profileImage?: string;
  profile_image?: string | null;
  createdAt: string;
}

export interface Psychic extends User {
  role: "psychic";
  bio: string;
  specialties: string[];
  pricePerMinute: number;
  rate: number;
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  userId?: string | number;
  displayName?: string;
  userName?: string;
  userEmail?: string;
  status?: string;
}

export type BookingStatus = "pending" | "confirmed" | "canceled" | "completed";

export interface Booking {
  id: string;
  customerId: string;
  psychicId: string;
  customerName: string;
  psychicName: string;
  dateTime: string;
  durationMinutes: number;
  duration: number;
  pricePerMinute: number;
  rate: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export type ConsultationStatus = "active" | "completed" | "canceled";

export interface Consultation {
  id: string;
  bookingId: string;
  psychicId: string;
  customerId: string;
  psychicName: string;
  customerName?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  rate: number;
  totalPrice: number;
  costLog: { at: string; duration: number; cost: number }[];
  status: ConsultationStatus;
  transcript?: string;
  notes?: string;
  scheduledAt?: string;
}

export interface Review {
  id: string;
  consultationId: string;
  psychicId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

export type Specialty =
  | "Love & Relationships"
  | "Career & Finance"
  | "Health & Wellness"
  | "Spiritual Guidance"
  | "Tarot & Divination"
  | "Astrology"
  | "Mediumship";

export const SPECIALTIES: readonly Specialty[] = [
  "Love & Relationships",
  "Career & Finance",
  "Health & Wellness",
  "Spiritual Guidance",
  "Tarot & Divination",
  "Astrology",
  "Mediumship",
];

export interface PsychicsFilter {
  specialty?: string;
  minRating?: number;
  maxRate?: number;
  search?: string;
}
