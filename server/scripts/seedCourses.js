/**
 * Seed computing courses into the database.
 * Run: node server/scripts/seedCourses.js
 */
require("module-alias/register");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { Course } = require("@models");
const sequelize = require("@src/shared/database/index");

const computingCourses = [
  // 100 Level - First Semester
  { courseCode: "CSC 101", title: "Introduction to Computer Science", description: "Fundamentals of computing, history of computers, number systems, and basic problem-solving techniques.", creditUnits: 3, level: "100", semester: "first" },
  { courseCode: "CSC 103", title: "Introduction to Programming I", description: "Introduction to programming concepts using Python/C. Variables, data types, control structures, and functions.", creditUnits: 3, level: "100", semester: "first" },
  { courseCode: "CSC 105", title: "Computer Applications", description: "Practical use of word processing, spreadsheets, presentation tools, and internet applications.", creditUnits: 2, level: "100", semester: "first" },
  { courseCode: "MTH 101", title: "Elementary Mathematics I", description: "Algebra, trigonometry, and elementary set theory for computing students.", creditUnits: 3, level: "100", semester: "first" },
  { courseCode: "MTH 103", title: "Elementary Mathematics II", description: "Calculus: limits, differentiation, and integration fundamentals.", creditUnits: 3, level: "100", semester: "first" },
  { courseCode: "PHY 101", title: "General Physics I", description: "Mechanics, heat, and properties of matter.", creditUnits: 3, level: "100", semester: "first" },
  { courseCode: "GST 101", title: "Use of English I", description: "Communication skills, grammar, and essay writing.", creditUnits: 2, level: "100", semester: "first" },

  // 100 Level - Second Semester
  { courseCode: "CSC 102", title: "Introduction to Programming II", description: "Object-oriented programming, arrays, file handling, and modular programming.", creditUnits: 3, level: "100", semester: "second" },
  { courseCode: "CSC 104", title: "Introduction to Logic and Digital Design", description: "Boolean algebra, logic gates, combinational and sequential circuits.", creditUnits: 3, level: "100", semester: "second" },
  { courseCode: "MTH 102", title: "Elementary Mathematics III", description: "Vectors, matrices, and linear algebra fundamentals.", creditUnits: 3, level: "100", semester: "second" },
  { courseCode: "PHY 102", title: "General Physics II", description: "Electricity, magnetism, and modern physics.", creditUnits: 3, level: "100", semester: "second" },
  { courseCode: "STA 102", title: "Introduction to Statistics", description: "Descriptive statistics, probability, and distributions.", creditUnits: 3, level: "100", semester: "second" },
  { courseCode: "GST 102", title: "Use of English II", description: "Advanced communication and report writing skills.", creditUnits: 2, level: "100", semester: "second" },

  // 200 Level - First Semester
  { courseCode: "CSC 201", title: "Computer Programming III", description: "Advanced programming in Java/C++. Inheritance, polymorphism, exception handling, and generics.", creditUnits: 3, level: "200", semester: "first" },
  { courseCode: "CSC 203", title: "Data Structures and Algorithms I", description: "Arrays, linked lists, stacks, queues, trees, sorting and searching algorithms.", creditUnits: 3, level: "200", semester: "first" },
  { courseCode: "CSC 205", title: "Operating Systems I", description: "Process management, memory management, file systems, and I/O systems.", creditUnits: 3, level: "200", semester: "first" },
  { courseCode: "CSC 207", title: "Computer Architecture", description: "CPU organization, instruction sets, memory hierarchy, pipelining, and I/O interfaces.", creditUnits: 3, level: "200", semester: "first" },
  { courseCode: "CSC 209", title: "Discrete Mathematics", description: "Sets, relations, functions, graph theory, and combinatorics for computing.", creditUnits: 3, level: "200", semester: "first" },
  { courseCode: "MTH 201", title: "Mathematical Methods I", description: "Ordinary differential equations and series solutions.", creditUnits: 3, level: "200", semester: "first" },

  // 200 Level - Second Semester
  { courseCode: "CSC 202", title: "Data Structures and Algorithms II", description: "Graphs, hash tables, advanced tree structures, algorithm complexity analysis.", creditUnits: 3, level: "200", semester: "second" },
  { courseCode: "CSC 204", title: "Database Management Systems I", description: "Relational model, SQL, normalization, ER diagrams, and database design.", creditUnits: 3, level: "200", semester: "second" },
  { courseCode: "CSC 206", title: "Systems Analysis and Design", description: "SDLC, requirement gathering, UML diagrams, feasibility studies.", creditUnits: 3, level: "200", semester: "second" },
  { courseCode: "CSC 208", title: "Introduction to Networking", description: "Network fundamentals, OSI model, TCP/IP, LAN/WAN, and network devices.", creditUnits: 3, level: "200", semester: "second" },
  { courseCode: "CSC 210", title: "Web Programming I", description: "HTML, CSS, JavaScript, and introduction to frontend development.", creditUnits: 3, level: "200", semester: "second" },
  { courseCode: "STA 202", title: "Applied Statistics", description: "Regression, hypothesis testing, ANOVA, and statistical software applications.", creditUnits: 3, level: "200", semester: "second" },

  // 300 Level - First Semester
  { courseCode: "CSC 301", title: "Software Engineering I", description: "Software development methodologies, Agile, requirements engineering, and project management.", creditUnits: 3, level: "300", semester: "first" },
  { courseCode: "CSC 303", title: "Operating Systems II", description: "Advanced OS concepts: distributed systems, virtual memory, security, and real-time OS.", creditUnits: 3, level: "300", semester: "first" },
  { courseCode: "CSC 305", title: "Computer Networks II", description: "Network programming, routing protocols, network security, and wireless networks.", creditUnits: 3, level: "300", semester: "first" },
  { courseCode: "CSC 307", title: "Artificial Intelligence I", description: "Introduction to AI, search algorithms, knowledge representation, expert systems.", creditUnits: 3, level: "300", semester: "first" },
  { courseCode: "CSC 309", title: "Theory of Computing", description: "Automata theory, formal languages, Turing machines, and computability.", creditUnits: 3, level: "300", semester: "first" },
  { courseCode: "CSC 311", title: "Web Programming II", description: "Backend development with Node.js/PHP, REST APIs, authentication, and deployment.", creditUnits: 3, level: "300", semester: "first" },

  // 300 Level - Second Semester
  { courseCode: "CSC 302", title: "Software Engineering II", description: "Software testing, quality assurance, design patterns, and DevOps practices.", creditUnits: 3, level: "300", semester: "second" },
  { courseCode: "CSC 304", title: "Database Management Systems II", description: "Advanced SQL, NoSQL databases, transactions, concurrency control, and distributed databases.", creditUnits: 3, level: "300", semester: "second" },
  { courseCode: "CSC 306", title: "Human Computer Interaction", description: "UI/UX principles, usability testing, accessibility, and interaction design.", creditUnits: 3, level: "300", semester: "second" },
  { courseCode: "CSC 308", title: "Information Security", description: "Cryptography, network security, ethical hacking, and security policies.", creditUnits: 3, level: "300", semester: "second" },
  { courseCode: "CSC 310", title: "Mobile Application Development", description: "Android/iOS development, React Native, responsive design, and app deployment.", creditUnits: 3, level: "300", semester: "second" },
  { courseCode: "CSC 312", title: "Industrial Training (SIWES)", description: "6-month industrial attachment in IT organizations.", creditUnits: 6, level: "300", semester: "second" },

  // 400 Level - First Semester
  { courseCode: "CSC 401", title: "Artificial Intelligence II", description: "Machine learning, neural networks, natural language processing, and computer vision.", creditUnits: 3, level: "400", semester: "first" },
  { courseCode: "CSC 403", title: "Compiler Design", description: "Lexical analysis, parsing, syntax-directed translation, code generation and optimization.", creditUnits: 3, level: "400", semester: "first" },
  { courseCode: "CSC 405", title: "Cloud Computing", description: "Cloud architecture, virtualization, containers, AWS/Azure services, and serverless computing.", creditUnits: 3, level: "400", semester: "first" },
  { courseCode: "CSC 407", title: "Data Science and Analytics", description: "Data mining, big data tools, data visualization, and predictive analytics.", creditUnits: 3, level: "400", semester: "first" },
  { courseCode: "CSC 409", title: "Computer Graphics and Multimedia", description: "2D/3D graphics, rendering, animation, and multimedia systems.", creditUnits: 3, level: "400", semester: "first" },
  { courseCode: "CSC 411", title: "Final Year Project I", description: "Research methodology, project proposal, literature review, and initial implementation.", creditUnits: 3, level: "400", semester: "first" },

  // 400 Level - Second Semester
  { courseCode: "CSC 402", title: "Advanced Networking and Security", description: "Network administration, cloud security, penetration testing, and forensics.", creditUnits: 3, level: "400", semester: "second" },
  { courseCode: "CSC 404", title: "Distributed Systems", description: "Distributed computing models, middleware, consensus algorithms, and microservices.", creditUnits: 3, level: "400", semester: "second" },
  { courseCode: "CSC 406", title: "Embedded Systems", description: "Microcontrollers, IoT, real-time systems, and hardware-software co-design.", creditUnits: 3, level: "400", semester: "second" },
  { courseCode: "CSC 408", title: "Professional Ethics in Computing", description: "Ethical issues, intellectual property, cyber law, and professional standards in IT.", creditUnits: 2, level: "400", semester: "second" },
  { courseCode: "CSC 410", title: "Final Year Project II", description: "Complete project implementation, testing, documentation, and defense.", creditUnits: 6, level: "400", semester: "second" },
];

async function seedCourses() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // Sync the Course model table
    await sequelize.models.Course.sync();
    
    // Also sync the junction table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS student_courses (
        student_id UUID REFERENCES student_profiles(user_id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (student_id, course_id)
      );
    `).catch(() => {
      // Table might already exist from Sequelize sync
      console.log("student_courses table already exists or was created by sync.");
    });

    let created = 0;
    let skipped = 0;

    for (const course of computingCourses) {
      const [, wasCreated] = await Course.findOrCreate({
        where: { courseCode: course.courseCode },
        defaults: course,
      });

      if (wasCreated) {
        created++;
        console.log(`  ✅ Created: ${course.courseCode} - ${course.title}`);
      } else {
        skipped++;
      }
    }

    console.log(`\nSeeding complete: ${created} created, ${skipped} already existed.`);
    console.log(`Total courses in database: ${await Course.count()}`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedCourses();
