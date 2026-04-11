# Peerup - Nigeria Implementation Guide

## Quick Reference for Your Project

This document helps you quickly locate where to make changes for Nigerian university context implementation.

---

## 1. Database Schema (Department & Level Filtering)

### Location: `server/src/models/`

**Files to modify/create:**
- Create file: `Department.js` - Define departments model
- Create file: `Level.js` - Define academic levels (100, 200, 300, 400)
- Modify: `Tutor.js` - Add department and level relationships

**Example Schema:**
```javascript
// server/src/models/Department.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // e.g., "Computer Science", "Medicine", "Law"
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      // e.g., "CS", "MED", "LAW"
    },
  });
};

// server/src/models/Level.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Level', {
    level: {
      type: DataTypes.ENUM('100', '200', '300', '400'),
      // Also support: 'ND1', 'ND2', 'HND1', 'HND2'
    },
    displayName: DataTypes.STRING, // "First Year", "Second Year", etc.
  });
};

// In server/src/models/Tutor.js, add:
Tutor.belongsTo(Department);
Tutor.belongsTo(Level);
```

---

## 2. API Routes (Filtering Endpoints)

### Location: `server/src/routes/`

**File to modify/create:**
- Create file: `departments.js` - List all departments and levels
- Modify: `tutors.js` - Add filter parameters

**Example Route:**
```javascript
// server/src/routes/departments.js
router.get('/departments', async (req, res) => {
  const departments = await Department.findAll();
  res.json(departments);
});

router.get('/levels', async (req, res) => {
  const levels = await Level.findAll();
  res.json(levels);
});

// In server/src/routes/tutors.js
router.get('/search', async (req, res) => {
  const { departmentId, level, subject } = req.query;
  
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (level) where.level = level;
  
  const tutors = await Tutor.findAll({
    where,
    include: [Department, Level],
  });
  
  res.json(tutors);
});
```

---

## 3. Frontend Components (UI for Filtering)

### Location: `client/src/components/` & `client/src/pages/`

**Files to create/modify:**

#### 1. Department/Level Filter Component
```
client/src/components/TutorFilters.jsx

Features:
- Dropdown for Department selection
- Dropdown for Academic Level
- Search input for course/subject
- Apply Filters button
```

**Example Component:**
```jsx
// client/src/components/TutorFilters.jsx
import { useQuery } from '@tanstack/react-query';
import { fetchDepartments, fetchLevels } from '@/services/filterService';

export default function TutorFilters({ onFilterChange }) {
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevels,
  });

  const [filters, setFilters] = useState({
    departmentId: '',
    level: '',
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <select value={filters.departmentId} onChange={(e) => 
        setFilters({...filters, departmentId: e.target.value})
      }>
        <option value="">Select Department</option>
        {departments?.map(dept => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>

      <select value={filters.level} onChange={(e) => 
        setFilters({...filters, level: e.target.value})
      }>
        <option value="">Select Level</option>
        {levels?.map(l => (
          <option key={l.id} value={l.level}>{l.displayName}</option>
        ))}
      </select>

      <button onClick={() => onFilterChange(filters)}>
        Find Tutors
      </button>
    </div>
  );
}
```

#### 2. API Service Function
```
client/src/services/filterService.js
```

```javascript
// client/src/services/filterService.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchDepartments = async () => {
  const { data } = await API.get('/departments');
  return data;
};

export const fetchLevels = async () => {
  const { data } = await API.get('/levels');
  return data;
};

export const searchTutors = async (filters) => {
  const { data } = await API.get('/tutors/search', { params: filters });
  return data;
};
```

---

## 4. Nigerian University Course Codes

### Location: `server/src/config/` & `server/src/models/`

**Files to create:**
- Create file: `nigerianCourses.js` - List of Nigerian university courses

```javascript
// server/src/config/nigerianCourses.js
export const NIGERIAN_COURSES = {
  ENGINEERING: {
    code: 'ENG',
    name: 'Engineering',
    subjects: [
      { code: 'MTH', name: 'Mathematics' },
      { code: 'PHY', name: 'Physics' },
      { code: 'CHM', name: 'Chemistry' },
    ]
  },
  MEDICINE: {
    code: 'MED',
    name: 'Medicine & Surgery',
    subjects: [
      { code: 'BIO', name: 'Biology' },
      { code: 'CHM', name: 'Chemistry' },
      { code: 'PHY', name: 'Physics' },
    ]
  },
  LAW: {
    code: 'LAW',
    name: 'Law',
    subjects: [
      { code: 'LGL', name: 'Legal Studies' },
      { code: 'ENG', name: 'English Language' },
    ]
  },
};

// For WAEC/NECO/JAMB
export const EXAM_SUBJECTS = {
  CORE: ['English Language', 'Mathematics'],
  SCIENCES: ['Physics', 'Chemistry', 'Biology'],
  SOCIAL_SCIENCES: ['History', 'Geography', 'Economics'],
  HUMANITIES: ['Literature', 'Government', 'Yoruba'],
};
```

---

## 5. Registration Form Updates

### Location: `client/src/pages/Register.jsx` or `client/src/components/RegistrationForm.jsx`

**Add these fields:**
- Department (select)
- Academic Level (select)
- Full Name
- State of Origin
- School/University
- Course/Major

**For Tutors add:**
- Certifications
- Teaching Experience
- Subjects they can teach
- Hourly Rate

---

## 6. Database Migrations

### Location: `server/src/migrations/`

**Run migrations to create tables:**
```bash
# From server directory
npm run migrate

# Or create new migration:
npx sequelize migration:generate --name add-departments-levels

# Then edit the migration file and add:
queryInterface.createTable('Departments', {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: { type: DataTypes.STRING },
  code: { type: DataTypes.STRING },
})
```

---

## 7. File Structure Reference

Complete path structure for your modifications:

```
server/
├── src/
│   ├── config/
│   │   └── nigerianCourses.js          ← CREATE: Course definitions
│   ├── models/
│   │   ├── Department.js               ← CREATE: Department model
│   │   ├── Level.js                    ← CREATE: Level model
│   │   ├── Tutor.js                    ← MODIFY: Add department/level relationships
│   │   └── Student.js                  ← MODIFY: Add department/level fields
│   ├── routes/
│   │   ├── departments.js              ← CREATE: Department endpoints
│   │   ├── tutors.js                   ← MODIFY: Add search filters
│   │   └── index.js                    ← MODIFY: Register new routes
│   └── migrations/
│       └── [timestamp]-add-departments-levels.js ← CREATE: DB migration
│
client/
├── src/
│   ├── components/
│   │   ├── TutorFilters.jsx            ← CREATE: Filter UI
│   │   └── TutorCard.jsx               ← MODIFY: Show department/level
│   ├── pages/
│   │   ├── Register.jsx                ← MODIFY: Add Nigerian fields
│   │   ├── TutorSearch.jsx             ← CREATE: Search with filters
│   │   └── TutorProfile.jsx            ← MODIFY: Show department/level
│   └── services/
│       ├── filterService.js            ← CREATE: Filter API calls
│       └── tutorService.js             ← MODIFY: Add search function
```

---

## 8. Development Workflow

### Step 1: Create Database Models
```bash
cd server
# Edit src/models/Department.js and Level.js
# Edit src/models/Tutor.js to add relationships
```

### Step 2: Create Migration
```bash
# Generate migration
npx sequelize migration:generate --name add-departments-levels

# Edit the generated migration file
# Run migration
npm run migrate
```

### Step 3: Create Backend Routes
```bash
# Edit src/routes/departments.js (new file)
# Edit src/routes/tutors.js (add filter logic)
# Update src/routes/index.js to register new routes
```

### Step 4: Test Backend
```bash
npm run dev
# Use Postman or browser to test:
# GET http://localhost:3000/api/departments
# GET http://localhost:3000/api/levels
# GET http://localhost:3000/api/tutors/search?departmentId=xxx&level=200
```

### Step 5: Create Frontend Components
```bash
cd client
# Create src/services/filterService.js
# Create src/components/TutorFilters.jsx
# Update src/pages/TutorSearch.jsx
```

### Step 6: Test Frontend
```bash
npm run dev
# Navigate to http://localhost:5173
# Test filter functionality
```

---

## 9. Testing Checklist

- [ ] Backend API responds to department requests
- [ ] Backend API responds to level requests
- [ ] Backend API filters tutors by department and level
- [ ] Frontend loads departments dropdown
- [ ] Frontend loads levels dropdown
- [ ] Frontend can filter tutors
- [ ] Filtered results display correctly
- [ ] Database saves department/level on registration

---

## 10. Common Issues & Solutions

### Issue: "Unknown attribute 'departmentId' in..." error
**Solution**: Run `npm run migrate` to create the database tables with the new columns

### Issue: Frontend not showing filtered results
**Solution**: 
1. Check DevTools Network tab - ensure API is returning data
2. Check Console for error messages
3. Verify `VITE_API_URL` in `.env` is correct

### Issue: Department dropdown is empty
**Solution**:
1. Seed sample data: `npm run seed`
2. Or manually insert: `INSERT INTO Departments (id, name, code) VALUES (...)`

---

## 11. Nigerian University Context

### Universities to support:
- University of Lagos (UNILAG)
- University of Ibadan (UI)
- Obafemi Awolowo University (OAU)
- Ahmadu Bello University (ABU)
- University of Nigeria, Nsukka (UNN)
- Covenant University
- And others...

### Courses to support:
- Engineering Programs
- Medical/Health Sciences
- Law
- Business Administration
- Computer Science
- Agriculture
- Arts/Humanities
- Social Sciences

### Entrance Exams:
- JAMB (Joint Admissions and Matriculation Board)
- WAEC (West African Examinations Council)
- NECO (National Examinations Council)

---

**Last Updated**: April 8, 2026
**Status**: Ready for implementation
