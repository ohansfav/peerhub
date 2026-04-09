# Tutor & Class System - Already Implemented

## Overview
The Peerhub system already has a complete tutor and class booking system built in. You don't need to implement it from scratch!

## System Architecture

### 1. **User Roles**
- **Admin** - Manages tutor approvals and platform settings
- **Tutor** - Creates availability slots and teaches students
- **Student** - Books classes with tutors

### 2. **How It Works**

#### For Tutors:
1. Sign up as a **tutor** (provide bio, education, subjects)
2. Create **availability slots** (specify dates, times, subjects)
3. Students can then **book these slots**
4. Accept/reject booking requests
5. Conduct the tutoring session

#### For Students:
1. Sign up as a **student**
2. Browse available tutors and their **time slots**
3. Book a slot with a tutor
4. Wait for tutor confirmation
5. Join the tutoring session

### 3. **Database Models (Already Exist)**

#### User Model
- Roles: admin, tutor, student
- Email-based login
- Profile image support

#### Tutor Model
- Bio, education, subjects expertise
- Approval status: pending → approved → active
- Profile visibility control
- Links to multiple subjects

#### Booking Model (= Classes)
- Paired tutor-student for a specific time
- Fields:
  - `tutorId` - who's teaching
  - `studentId` - who's taking the class
  - `subject` - what subject is being taught
  - `scheduledStart` / `scheduledEnd` - when the class happens
  - `status`: open → pending → confirmed → completed
  - `meetingLink` - video call/meeting URL

#### Subject Model
- Subjects that can be taught (Math, English, Science, etc.)
- Supports filtering tutors by subject

### 4. **API Endpoints (Already Implemented)**

**Tutor Endpoints:**
- `GET /api/tutors` - Browse all tutors with filters (subject, rating, name)
- `POST /api/tutors/onboard` - Create tutor profile
- `PUT /api/tutors/{id}` - Update tutor profile
- `GET /api/tutors/{id}` - Get tutor details

**Booking/Class Endpoints:**
- `POST /api/bookings` - Student books a tutor's time slot
- `GET /api/bookings` - List student's bookings
- `PUT /api/bookings/{id}/confirm` - Tutor confirms the booking
- `PUT /api/bookings/{id}/decline` - Tutor rejects the booking
- `GET /api/bookings/{id}/upcoming` - Get next upcoming session

### 5. **Features Included**

✅ Filter tutors by:
- Subject
- Rating/reviews
- Name search
- Availability

✅ Email notifications:
- When booking is created/confirmed
- When booking is cancelled/rescheduled
- Automatic reminders

✅ Booking status tracking:
- Open (tutor's free slot)
- Pending (student booked, waiting for tutor confirmation)
- Confirmed (tutor approved)
- Completed (class finished)
- Cancelled

✅ Meeting links:
- Tutors can add video call URLs
- Support for Zoom, Google Meet, etc.

✅ Session notes:
- Tutors can add notes after class
- Students can add notes after class

### 6. **What You Need to Do**

To test the tutor/class system:

**Step 1: Create a Student Account**
- Sign up with role: "student"
- (Optional) Complete student profile with level, department

**Step 2: Create a Tutor Account**
- Sign up with role: "tutor"
- Complete tutor profile:
  - Bio/experience
  - Education credentials
  - Subjects you can teach
  - Upload certification document (optional for test)

**Step 3: Create Availability (As Tutor)**
- Use API to create open booking slots
- Specify: subject, start time, end time
- Set meeting link (Zoom/Google Meet URL)

**Step 4: Browse & Book (As Student)**
- Browse available tutors
- View their open time slots
- Book a slot you're interested in

**Step 5: Confirmation Flow**
- Tutor sees "pending" booking request
- Tutor confirms or declines
- Student gets notified
- For confirmed bookings, join the meeting link

### 7. **Frontend Implementation Needed**

The backend is complete, but the frontend needs pages for:

- **Tutor Discovery Page**
  - Filter tutors by subject/rating
  - See tutor profiles, education, reviews

- **Tutor Onboarding Page**
  - Form to fill tutor profile
  - Document upload
  - Subject selection

- **Availability Management Page** (Tutor)
  - Create/edit/delete time slots
  - Calendar view
  - Meeting link management

- **Booking Management Page** (Tutor)
  - See pending bookings
  - Approve/decline buttons
  - Calendar of confirmed sessions

- **Student Booking Page**
  - Browse tutors and their slots
  - Book time slots
  - View my bookings status
  - Join meeting when time comes

### 8. **Test the System**

You can test with:
- **Admin account** (already created): admin@peerhub.com / admin123
- **Create a tutor account test**
- **Create a student account test**
- Use API testing tools (Postman, Insomnia) to test endpoints

### 9. **Stream Chat (Now Offline)**

The system also supports:
- Real-time messaging between tutor/student (Stream Chat integration)
- Now configured to work **offline** (no internet needed for testing)
- Falls back to dummy tokens when Stream services aren't available

---

**Summary**: You have a complete backend ready to go. Focus on building the frontend UI to let users:
1. Create tutor/student profiles
2. Browse tutors and book classes
3. Manage their bookings
4. Join virtual sessions

The hard part (database design, APIs, authentication) is done! 🎉
