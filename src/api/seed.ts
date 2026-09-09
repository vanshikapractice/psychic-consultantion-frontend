import type { Psychic, Specialty } from "../types";
import type { UserRecord } from "./types";

export interface SeedPsychic extends Psychic {
  password: string;
}

export const seedCustomers: UserRecord[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@psychic.app",
    password: "customer123",
    role: "customer",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b26339?w=100&h=100&fit=crop&facepad=2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Alex Rivera",
    email: "alex@psychic.app",
    password: "customer123",
    role: "customer",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-dcde0991af427?w=100&h=100&fit=crop&facepad=2",
    createdAt: new Date().toISOString(),
  },
];

export const seedPsychics: SeedPsychic[] = [
  {
    id: "p1",
    name: "Luna Stardust",
    email: "luna@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-1573496314633-bf1d6b8c6b40?w=200&h=200&fit=crop",
    bio: "30+ years reading tarot and oracle cards. Specializing in love and life path guidance.",
    specialties: ["Love & Relationships", "Spiritual Guidance", "Tarot & Divination"],
    pricePerMinute: 3.5,
    rate: 3.5,
    rating: 4.8,
    reviewCount: 342,
    yearsOfExperience: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Dr. Marcus Veil",
    email: "marcus@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-dcde0991af427?w=200&h=200&fit=crop",
    bio: "Professional astrologer and medium. Helping souls find clarity through astrological charts.",
    specialties: ["Astrology", "Mediumship", "Spiritual Guidance"],
    pricePerMinute: 5.0,
    rate: 5.0,
    rating: 4.9,
    reviewCount: 518,
    yearsOfExperience: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Isabella Moonsong",
    email: "isabella@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b26339?w=200&h=200&fit=crop",
    bio: "Career coach and financial intuitive. Transforming your professional journey with insight.",
    specialties: ["Career & Finance", "Spiritual Guidance"],
    pricePerMinute: 4.25,
    rate: 4.25,
    rating: 4.7,
    reviewCount: 209,
    yearsOfExperience: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p4",
    name: "Ravi Patel",
    email: "ravi@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-dcde0991af427?w=200&h=200&fit=crop",
    bio: "Reiki master and wellness intuitive. Healing energy work combined with card readings.",
    specialties: ["Health & Wellness", "Spiritual Guidance", "Tarot & Divination"],
    pricePerMinute: 3.0,
    rate: 3.0,
    rating: 4.5,
    reviewCount: 176,
    yearsOfExperience: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p5",
    name: "Zara Nightwhisper",
    email: "zara@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-158023879136-45d2c4f44d52?w=200&h=200&fit=crop",
    bio: "Clairvoyant medium connecting with spirit guides to deliver messages from loved ones.",
    specialties: ["Mediumship", "Spiritual Guidance"],
    pricePerMinute: 6.5,
    rate: 6.5,
    rating: 4.9,
    reviewCount: 298,
    yearsOfExperience: 22,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p6",
    name: "Finn Oakenshield",
    email: "finn@psychic.app",
    password: "psychic123",
    role: "psychic",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-dcde0991af427?w=200&h=200&fit=crop",
    bio: "Traditional Celtic tarot reader. Ancient wisdom for modern questions.",
    specialties: ["Tarot & Divination", "Love & Relationships"],
    pricePerMinute: 2.5,
    rate: 2.5,
    rating: 4.3,
    reviewCount: 143,
    yearsOfExperience: 15,
    createdAt: new Date().toISOString(),
  },
];

export const seedAllUsers: UserRecord[] = [...seedCustomers, ...seedPsychics];

export const DEFAULT_ROLE = "customer" as const;

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  "Love & Relationships": "Love & Relationships",
  "Career & Finance": "Career & Finance",
  "Health & Wellness": "Health & Wellness",
  "Spiritual Guidance": "Spiritual Guidance",
  "Tarot & Divination": "Tarot & Divination",
  Astrology: "Astrology",
  Mediumship: "Mediumship",
};
