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
    alt: "University students collaborating in lecture hall",
  },

  // About Section
  about: {
    studentImage: "/images/student.png",
    alt: "Student learning on campus",
  },

  // Call-to-Action Section
  cta: {
    backgroundImage: "/images/cta.png",
    alt: "Students collaborating on campus",
  },

  // Logo (you can replace this with your actual logo path)
  logo: {
    image: "/images/logo.png?v=2",
    alt: "Peerup Logo",
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
    role: "300L Biochemistry Student",
    rating: 4.88,
    text: "The Peerup platform made my semester exam preparation so much easier. I found a tutor who broke down Organic Chemistry perfectly and I aced my exams!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/iwaria-inc-SESt1VL2D-w-unsplash_piqb8c",
    alt: "Female university student smiling",
  },
  {
    id: 2,
    name: "Blessing Okoro",
    role: "400L Computer Science Tutor",
    rating: 4.6,
    text: "As a final year student, Peerup gave me a platform to help juniors while earning. The scheduling system works perfectly around my lecture timetable.",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/ikechukwu-julius-ugwu-F9bkOxw-dyQ-unsplash_gsvuwj",
    alt: "Female university tutor",
  },
  {
    id: 3,
    name: "David Adeyemi",
    role: "200L Engineering Student",
    rating: 5,
    text: "I was struggling with Calculus but my tutor on Peerup was so patient. Now I actually understand differential equations and integration!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/josh-kidd-2gOu7Nfrnns-unsplash_hbaaqm",
    alt: "Male university student",
  },
  {
    id: 4,
    name: "Emmanuel Nnamdi",
    role: "500L Law Tutor",
    rating: 4.4,
    text: "Peerup gave me a great way to stay sharp in my courses while mentoring younger students. The flexible scheduling fits my busy programme perfectly.",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/johnson-sesbire-K-USwvom-Pw-unsplash_jt4uej",
    alt: "Male university student",
  },
  {
    id: 5,
    name: "Khadijah Musa",
    role: "100L Microbiology Student",
    rating: 4.8,
    text: "General Chemistry used to confuse me but through Peerup, my tutor breaks everything down step by step. It's easy to find someone who cares about my progress!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/adeniji-abdullahi-a-CPz2KWjCwDQ-unsplash_lcttjh",
    alt: "Female university student studying",
  },
  {
    id: 6,
    name: "Ibrahim Lawal",
    role: "300L English Tutor",
    rating: 5,
    text: "Teaching academic writing on Peerup has been incredible. I help fellow students improve their essays and communication skills while earning. It's a win-win!",
    image:
      "https://res.cloudinary.com/dwllr51vn/image/upload/w_128,h_128,c_fill,g_face,q_auto,f_auto/mubarak-showole-Ve7xjKImd28-unsplash_tnhkcv",
    alt: "Male university tutor smiling",
  },
];

/**
 * FAQ DATA
 * Update these questions and answers to match your actual FAQ content
 */
export const FAQ_ITEMS = [
  {
    id: 1,
    question: "What courses are available on the platform?",
    answer:
      "Peerup covers a wide range of university courses including Computer Science, Mathematics, Physics, Chemistry, Biology, Accounting, Economics, Engineering, Law, Mass Communication, and more.",
  },
  {
    id: 2,
    question: "Who are the Tutors?",
    answer:
      "Our tutors are verified students and instructors from universities. Each tutor undergoes a credential check and academic performance review to ensure they meet our quality standards for peer-assisted learning.",
  },
  {
    id: 3,
    question: "How do I become a Tutor?",
    answer:
      "Any university student can apply as a tutor on Peerup. Select the courses you excel in, share your academic background, and upload your student ID or credentials. Once verified and approved, you can set your availability and start tutoring.",
  },
  {
    id: 4,
    question: "Is the platform free to use?",
    answer:
      "Peerup offers both free and premium features. Students can access the course resource library, learning materials, and community forum for free. Live one-on-one tutoring sessions and premium resources are available through affordable plans.",
  },
];

/**
 * HOW IT WORKS STEPS
 * These define the 6-step process displayed on the landing page
 */
export const HOW_IT_WORKS_STEPS = [
  {
    id: 1,
    title: "Create Your Account",
    description:
      "Sign up with your institutional email and get matched with resources tailored to your programme.",
    icon: "UserPlus",
  },
  {
    id: 2,
    title: "Access Your Dashboard",
    description:
      "View your enrolled courses, upcoming sessions, learning progress, and resources in one place.",
    icon: "Monitor",
  },
  {
    id: 3,
    title: "Join Live Sessions",
    description:
      "Attend real-time online tutoring sessions tailored to your course curriculum.",
    icon: "Video",
  },
  {
    id: 4,
    title: "Explore Course Materials",
    description:
      "Access lecture notes, past questions, study guides, and exam materials for your courses.",
    icon: "BookOpen",
  },
  {
    id: 5,
    title: "Ask a Question Anytime",
    description:
      "Post academic questions and get help from verified tutors and fellow students.",
    icon: "MessageCircle",
  },
  {
    id: 6,
    title: "Track Your Progress",
    description:
      "Monitor your learning milestones, course completion, and academic performance over time.",
    icon: "Trophy",
  },
];
