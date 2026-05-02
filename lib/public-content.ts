export type PublicTestimonial = {
  name: string;
  role: string;
  quote: string;
  result: string;
};

export type PublicFaqItem = {
  question: string;
  answer: string;
};

export const teacherBrand = {
  name: "The Elite English Academy",
  tagline:
    "Personal English lessons that feel calm, clear, and genuinely supportive.",
  heroEyebrow: "Personal English teacher for school learners",
  heroTitle:
    "Warm, structured English classes that help students grow with confidence.",
  heroDescription:
    "A premium but personal learning space for students who need clear explanations, steady practice, and parent-friendly communication.",
  courseIntro:
    "Each class is designed to stay focused, easy to follow, and useful for real school progress without overwhelming students.",
  aboutIntro:
    "This is a personal teaching practice built around clarity, routine, and kind support. Lessons stay organized, expectations stay simple, and families always know what comes next.",
  contactIntro:
    "Families can ask about the right level, current openings, schedules, and fees before joining. The goal is to make enrollment feel easy and reassuring.",
  teachingPillars: [
    {
      title: "Clear weekly structure",
      description:
        "Students know what they are learning, what to practice, and how to improve from one week to the next.",
    },
    {
      title: "Confident communication",
      description:
        "Speaking, writing, reading, and listening are strengthened in a balanced way so students feel confident using English.",
    },
    {
      title: "Parent-friendly updates",
      description:
        "Homework, attendance, and progress stay simple to follow so parents can support learning without extra stress.",
    },
  ],
  promises: [
    "Small, focused classes with personal attention",
    "Simple communication for students and parents",
    "Steady progress with readable feedback",
    "A calm, premium learning experience",
  ],
} as const;

export const testimonials: PublicTestimonial[] = [
  {
    name: "Nethmi P.",
    role: "Parent of a Grade 6 student",
    quote:
      "The classes feel warm and very organized. My daughter understands what to study each week, and I always know how she is doing.",
    result:
      "Better confidence in school English and more consistent homework habits",
  },
  {
    name: "Kavindu R.",
    role: "Ongoing student",
    quote:
      "Lessons are easy to follow and never confusing. I feel much more comfortable speaking in English now.",
    result: "Improved speaking confidence and classroom participation",
  },
  {
    name: "Mrs. Silva",
    role: "Parent of two learners",
    quote:
      "What I appreciate most is the communication. It feels personal, professional, and simple enough for busy parents.",
    result: "Clear progress visibility without a complicated system",
  },
];

export const faqs: PublicFaqItem[] = [
  {
    question: "Who are these classes for?",
    answer:
      "The classes are best for school students who want better English results, stronger confidence, and a more supportive weekly routine.",
  },
  {
    question: "Are classes online or in person?",
    answer:
      "The website shows the delivery mode for each class. Some sessions are live online, while others may be offered in person depending on the current schedule.",
  },
  {
    question: "How do parents stay updated?",
    answer:
      "After enrollment, parents can use the portal to follow homework, attendance, class updates, and progress in a simple format.",
  },
  {
    question: "Can I ask which class is right before enrolling?",
    answer:
      "Yes. The contact page is public so families can ask about level, schedule, fees, and suitability before joining.",
  },
  {
    question: "Do you offer personal support for struggling students?",
    answer:
      "Yes. The teaching style is built around clear explanation, patient guidance, and consistent support for students who need more structure.",
  },
];
