import {
  BookOpenCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export type FeaturedCourse = {
  id: string;
  category: string;
  title: string;
  description: string;
  students: string;
  duration: string;
  price: string;
  level: string;
  image: string;
};

export const heroMetrics = [
  { value: "120+", label: "Premium learning programs" },
  { value: "18k", label: "Course enrollments supported" },
  { value: "94%", label: "Learner completion rate" }
] as const;

export const heroHighlights = [
  {
    label: "Live coaching",
    description: "Interactive sessions with structured teacher support",
    icon: BookOpenCheck
  },
  {
    label: "Trusted delivery",
    description: "A polished experience parents and learners can rely on",
    icon: ShieldCheck
  },
  {
    label: "Modern platform",
    description: "A clean LMS flow designed for enrollment and retention",
    icon: Sparkles
  }
] as const;

export const partnerBrands = [
  "LearnSphere",
  "ClassPilot",
  "Mentora",
  "SkillBridge",
  "BrightPath",
  "FutureEdge"
] as const;

export const featuredCourses: FeaturedCourse[] = [
  {
    id: "academic-writing-lab",
    category: "Writing Lab",
    title: "Academic Writing Lab",
    description:
      "Help learners write clearer essays, reports, and polished school assignments with weekly live feedback.",
    students: "1.4k students",
    duration: "8 weeks",
    price: "$89",
    level: "Intermediate",
    image: "/courses/academic-writing-lab.svg"
  },
  {
    id: "spoken-english-studio",
    category: "Speaking",
    title: "Spoken English Studio",
    description:
      "A confidence-first coaching path for learners who want stronger fluency, pronunciation, and real speaking practice.",
    students: "2.1k students",
    duration: "10 weeks",
    price: "$109",
    level: "Beginner",
    image: "/courses/spoken-english-studio.svg"
  },
  {
    id: "exam-success-accelerator",
    category: "Exam Prep",
    title: "Exam Success Accelerator",
    description:
      "Structured coaching for grammar, comprehension, and answer strategies that improve school and exam performance.",
    students: "980 students",
    duration: "12 weeks",
    price: "$129",
    level: "Advanced",
    image: "/courses/exam-success-accelerator.svg"
  },
  {
    id: "young-learners-foundation",
    category: "Junior English",
    title: "Young Learners Foundation",
    description:
      "A warm, interactive program for younger students building core reading, vocabulary, and listening confidence.",
    students: "1.7k students",
    duration: "6 weeks",
    price: "$69",
    level: "Primary",
    image: "/courses/young-learners-foundation.svg"
  }
];
