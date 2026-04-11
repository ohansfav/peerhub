import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuizzes, createQuiz, deleteQuiz } from "../../lib/api/quiz/quizApi";
import { createBroadcastMessage } from "../../lib/api/broadcast/broadcastApi";
import { getSubjects } from "../../lib/api/common/subjectsApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import Spinner from "../../components/common/Spinner";
import { Plus, Trash2, Send, BookOpen, MessageSquare, X } from "lucide-react";

const TutorQuizPage = () => {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["tutorQuizzes"],
    queryFn: getQuizzes,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorQuizzes"] });
      handleToastSuccess("Quiz deleted");
    },
    onError: (err) => handleToastError(err, "Failed to delete quiz"),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quizzes & Broadcasts</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "quizzes"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1" />
          Quizzes
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "broadcast"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Broadcast Message
        </button>
      </div>

      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowCreateQuiz(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>

          {showCreateQuiz && (
            <CreateQuizForm
              subjects={subjects}
              onClose={() => setShowCreateQuiz(false)}
              queryClient={queryClient}
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white border rounded-xl">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No quizzes created yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first quiz for students to take
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white border rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {quiz.questions?.length || 0} questions
                      {quiz.subject && ` · ${quiz.subject.name}`}
                      {quiz.timeLimit && ` · ${quiz.timeLimit} min`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Delete this quiz?")) deleteMutation.mutate(quiz.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "broadcast" && (
        <BroadcastForm />
      )}
    </div>
  );
};

function CreateQuizForm({ subjects, onClose, queryClient }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", ""], correctAnswer: 0 },
  ]);

  const createMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorQuizzes"] });
      handleToastSuccess("Quiz created successfully!");
      onClose();
    },
    onError: (err) => handleToastError(err, "Failed to create quiz"),
  });

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options = [...updated[qIndex].options, ""];
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options = [...updated[qIndex].options];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
        updated[qIndex].correctAnswer = 0;
      }
      setQuestions(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanQuestions = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: q.correctAnswer,
    }));

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      subjectId: subjectId ? Number(subjectId) : null,
      timeLimit: timeLimit ? Number(timeLimit) : null,
      questions: cleanQuestions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create New Quiz</h2>
        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Quiz title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="No limit"
            min="1"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Questions</h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Question {qIndex + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your question"
              required
            />
            <div className="space-y-2">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctAnswer === oIndex}
                    onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                    className="text-blue-600"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                + Add Option
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Select the radio button next to the correct answer
            </p>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {createMutation.isPending ? "Creating..." : "Create Quiz"}
      </button>
    </form>
  );
}

function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const broadcastMutation = useMutation({
    mutationFn: createBroadcastMessage,
    onSuccess: () => {
      handleToastSuccess("Broadcast message sent!");
      setTitle("");
      setMessage("");
      setTargetRole("");
    },
    onError: (err) => handleToastError(err, "Failed to send message"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    broadcastMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      targetRole: targetRole || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Send className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Send Broadcast Message</h2>
      </div>
      <p className="text-sm text-gray-500">
        Send a message that will appear in everyone's notification page.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Message title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Write your broadcast message..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Everyone</option>
          <option value="student">Students Only</option>
          <option value="tutor">Tutors Only</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={broadcastMutation.isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {broadcastMutation.isPending ? "Sending..." : "Send Broadcast"}
      </button>
    </form>
  );
}

export default TutorQuizPage;
