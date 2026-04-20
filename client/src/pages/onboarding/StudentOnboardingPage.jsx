import { useEffect, useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import StepHeader from "../../components/onboarding/StepHeader";
import SelectableCardWithCheckbox from "../../components/onboarding/SelectableCardWithCheckBox";
import SelectableCardList from "../../components/onboarding/SelectableCardList";
import ProgressBar from "../../components/onboarding/ProgressBar";
import StepNavigation from "../../components/onboarding/StepNavigation";
import { getExams, getSubjects } from "../../lib/api/common/subjectsApi";
import useCreateStudent from "../../hooks/student/useCreateStudent";
import ErrorAlert from "../../components/common/ErrorAlert";
import { handleToastError } from "../../utils/toastDisplayHandler";

const StudentOnboardingPage = () => {
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [localError, setLocalError] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    learningGoals: [],
    subjects: [],
    exams: [],
  });

  const toggleGoal = (goal) =>
    setFormData((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter((g) => g !== goal)
        : [...prev.learningGoals, goal],
    }));

  const toggleSubject = (subject) => {
    const subjectId = Number(subject);
    if (!Number.isInteger(subjectId) || subjectId <= 0) return;

    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((s) => s !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const toggleExam = (exam) => {
    const examId = Number(exam);
    if (!Number.isInteger(examId) || examId <= 0) return;

    setFormData((prev) => ({
      ...prev,
      exams: prev.exams.includes(examId)
        ? prev.exams.filter((e) => e !== examId)
        : [...prev.exams, examId],
    }));
  };

  useEffect(() => {
    try {
      async function fetchData() {
        const subjects = await getSubjects();
        const safeSubjects = Array.isArray(subjects)
          ? subjects.filter(
              (subject) =>
                Number.isInteger(Number(subject?.id)) && Number(subject.id) > 0
            )
          : [];
        setSubjectInfo(safeSubjects);
        const exams = await getExams();
        const safeExams = Array.isArray(exams)
          ? exams.filter(
              (exam) => Number.isInteger(Number(exam?.id)) && Number(exam.id) > 0
            )
          : [];
        setExamInfo(safeExams);
      }

      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
      handleToastError(error);
    }
  }, []);

  const {
    isPending,
    createStudentMutation,
    fieldErrors,
    generalError,
    clearErrors,
  } = useCreateStudent();

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const safeSubjects = [...new Set(
      formData.subjects
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )];
    const safeExams = [...new Set(
      formData.exams
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )];

    if (safeSubjects.length === 0) {
      setLocalError("Please select at least one valid subject.");
      return;
    }

    if (safeExams.length === 0) {
      setLocalError("Please select at least one valid exam.");
      return;
    }

    setLocalError("");
    clearErrors();
    createStudentMutation({
      ...formData,
      subjects: safeSubjects,
      exams: safeExams,
    });
  };

  // Step Components
  const steps = [
    <div key="step1">
      <StepHeader
        title="What are your learning goals?"
        subtitle="Let us help you personalize your experience"
      />
      <SelectableCardWithCheckbox
        options={[
          "Prepare for an upcoming exam",
          "Get better at subjects I struggle with",
          "Get personalized help from tutors",
          "Build a consistent study routine",
        ]}
        selectedItems={formData.learningGoals}
        onToggle={toggleGoal}
      />
    </div>,

    <div key="step2">
      <StepHeader
        title="What subjects are you interested in?"
        subtitle="Choose all that apply"
      />
      <SelectableCardList
        options={subjectInfo}
        selectedItems={formData.subjects}
        onToggle={toggleSubject}
        roundedFull={true}
      />
    </div>,

    <div key="step3">
      <StepHeader
        title="What assessments are you preparing for?"
        subtitle="Select the university assessments relevant to you"
      />
      <SelectableCardList
        options={examInfo}
        selectedItems={formData.exams}
        onToggle={toggleExam}
        roundedFull={true}
        className="w-full"
      />
    </div>,
  ];

  return (
    <AuthLayout>
      <div className="flex flex-col justify-between md:h-[90vh] space-y-1">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <ErrorAlert error={generalError || localError} />

        <div className="flex-1">{steps[currentStep - 1]}</div>

        {currentStep === 1 && formData.learningGoals.length === 0 && (
          <p className="text-sm text-red-500 mt-2">
            Please select at least one goal to continue.
          </p>
        )}
        {currentStep === 2 && formData.subjects.length === 0 && (
          <p className="text-sm text-red-500 mt-2">
            Please select at least one subject to continue.
          </p>
        )}
        {currentStep === 3 && formData.exams.length === 0 && (
          <p className="text-sm text-red-500 mt-2">
            Please select at least one exam to continue.
          </p>
        )}

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={() => handleStepChange(currentStep - 1)}
          onNext={() => handleStepChange(currentStep + 1)}
          onSubmit={handleSubmit}
          isLoading={isPending}
          disableNext={
            (currentStep === 1 && formData.learningGoals.length === 0) ||
            (currentStep === 2 && formData.subjects.length === 0) ||
            (currentStep === 3 && formData.exams.length === 0)
          }
        />
      </div>
    </AuthLayout>
  );
};

export default StudentOnboardingPage;
