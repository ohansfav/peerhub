/**
 * ASSETS CONFIGURATION
 *
 * This file centralizes all images, icons, and media assets used in the landing page.
 * To replace placeholder assets with your actual assets:
 *
 * 1. Add your images to a public/images folder
 * 2. Update the URLs below to point to your actual image paths
 * 3. All components will automatically use your new assets!
 *
 * Format: Replace the Pexels URLs with your actual image paths like '/images/hero-bg.jpg'
 */

export const ASSETS = {
  // Hero Section
  hero: {
    backgroundImage: "/images/hero.png",
    alt: "Nigerian students studying together",
  },

  // About Section
  about: {
    studentImage: "/images/student.png",
    alt: "Student learning with laptop",
  },

  // Call-to-Action Section
  cta: {
    backgroundImage: "/images/cta.png",
    alt: "Students collaborating on learning",
  },

  // Logo (you can replace this with your actual logo path)
  logo: {
    image: "/images/logo.png?v=2",
    alt: "Peerhub Logo",
  },
};

/**
 * TESTIMONIALS DATA
 * Update the testimonial content here to match your actual user testimonials
 */
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Aminat Olaleye",
    role: "SS3 Student",
    rating: 4.88,
    text: "My WAEC preparation was stressful until I found a tutor on Peerhub. She made Physics so simple and I scored A1!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/iwaria-inc-SESt1VL2D-w-unsplash_piqb8c",
    alt: "Nigerian female student smiling",
  },
  {
    id: 2,
    name: "Blessing Okoro",
    role: "NYSC Tutor",
    rating: 4.6,
    text: "During my service year, Peerhub helped me earn extra income while making a difference. The students are eager to learn and the platform is reliable.",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/ikechukwu-julius-ugwu-F9bkOxw-dyQ-unsplash_gsvuwj",
    alt: "Nigerian female young tutor",
  },
  {
    id: 3,
    name: "David Adeyemi",
    role: "SS2 Student",
    rating: 5,
    text: "I was failing Mathematics badly but my tutor on Peerhub was so patient with me. Now I actually understand algebra and geometry!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/josh-kidd-2gOu7Nfrnns-unsplash_hbaaqm",
    alt: "Nigerian male student",
  },
  {
    id: 4,
    name: "Emmanuel Nnamdi",
    role: "University Graduate Tutor",
    rating: 4.4,
    text: "As a fresh graduate, Peerhub gave me a great way to stay sharp in my field while helping secondary school students. The scheduling is flexible which I really appreciate.",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/johnson-sesbire-K-USwvom-Pw-unsplash_jt4uej",
    alt: "Nigerian male young professional",
  },
  {
    id: 5,
    name: "Khadijah Musa",
    role: "SS1 Student",
    rating: 4.8,
    text: "Chemistry used to confuse me so much but my tutor breaks everything down step by step. Peerhub made it easy to find someone who actually cares about my progress!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/adeniji-abdullahi-a-CPz2KWjCwDQ-unsplash_lcttjh",
    alt: "Nigerian female student studying",
  },
  {
    id: 6,
    name: "Ibrahim Lawal",
    role: "NYSC Tutor",
    rating: 5,
    text: "Teaching English on Peerhub has been amazing. I get to help students improve their writing and speaking skills while earning during my service year. Win-win!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/t_edupeerhub-landing-testimonials/mubarak-showole-Ve7xjKImd28-unsplash_tnhkcv",
    alt: "Nigerian male tutor smiling",
  },
];

/**
 * FAQ DATA
 * Update these questions and answers to match your actual FAQ content
 */
export const FAQ_ITEMS = [
  {
    id: 1,
    question: "What subjects are covered?",
    answer:
      "Peerhub covers all major subjects required for WAEC, NECO, and JAMB examinations including Mathematics, English Language, Physics, Chemistry, Biology, Economics, Government, Literature, and more. Our tutors are qualified to teach across the Nigerian secondary school curriculum.",
  },
  {
    id: 2,
    question: "Who are the Tutors?",
    answer:
      "Our tutors are carefully vetted university undergraduates and recent graduates who have excelled in their fields. Each tutor goes through a rigorous verification process including credential checks, subject matter assessments, and teaching demonstrations to ensure they meet our high standards for quality education.",
  },
  {
    id: 3,
    question: "How do I become a Tutor?",
    answer:
      "To become a tutor on Peerhub, you need to be a current university undergraduate or recent graduate. Apply through our platform by submitting your credentials, academic transcripts, and completing our tutor assessment. Once verified and approved, you can start creating your availability and connecting with students.",
  },
  {
    id: 4,
    question: "Is Peerhub free to use?",
    answer:
      "Peerhub offers both free and premium features. Students can access our resource library and ask questions in the community forum for free. Live one-on-one tutoring sessions are available through affordable subscription plans designed to be accessible to Nigerian students. We also offer scholarship programs for students in need.",
  },
];

/**
 * HOW IT WORKS STEPS
 * These define the 6-step process displayed on the landing page
 */
export const HOW_IT_WORKS_STEPS = [
  {
    id: 1,
    title: "Join Peerhub",
    description:
      "Sign up and get guided towards the support of a tutor ready to teach.",
    icon: "UserPlus",
  },
  {
    id: 2,
    title: "Access Your Dashboard",
    description:
      "Instantly view your upcoming sessions, streaks, past completions and more.",
    icon: "Monitor",
  },
  {
    id: 3,
    title: "Join Live Sessions",
    description:
      "Learn with others in real-time online sessions tailored to your academic needs.",
    icon: "Video",
  },
  {
    id: 4,
    title: "Explore the Library",
    description:
      "Access learning resources, notes and past WAEC/NECO/JAMB questions materials tailored to your studied classes.",
    icon: "BookOpen",
  },
  {
    id: 5,
    title: "Ask a Question Anytime",
    description:
      "Post academic questions to get help from verified tutors 24 x 7 or tutor assistance.",
    icon: "MessageCircle",
  },
  {
    id: 6,
    title: "Stay Motivated",
    description:
      "Earn badges, maintain learning streaks, and celebrate milestones as you go along.",
    icon: "Trophy",
  },
];
