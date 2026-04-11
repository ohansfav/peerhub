import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuizzes, submitQuiz } from "../../lib/api/quiz/quizApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import Spinner from "../../components/common/Spinner";
import { BookOpen, CheckCircle, Clock, ArrowLeft, Trophy } from "lucide-react";

const StudentQuizPage = () => {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["studentQuizzes"],
    queryFn: getQuizzes,
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, answers }) => submitQuiz(id, answers),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["studentQuizzes"] });
      queryClient.invalidateQueries({ queryKey: ["studentStats"] });
      handleToastSuccess(`Quiz completed! Score: ${data.score}/${data.totalQuestions}`);
    },
    onError: (err) => handleToastError(err, "Failed to submit quiz"),
  });

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setResult(null);
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    const updated = [...answers];
    updated[questionIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleSubmit = () => {
    if (answers.some((a) => a === null)) {
      handleToastError(null, "Please answer all questions before submitting");
      return;
    }
    submitMutation.mutate({ id: activeQuiz.id, answers });
  };

  const backToList = () => {
    setActiveQuiz(null);
    setAnswers([]);
    setResult(null);
  };

  // Taking a quiz view
  if (activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={backToList}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </button>

        <div className="bg-white border rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h1>
          {activeQuiz.description && (
            <p className="text-gray-500 text-sm mt-1">{activeQuiz.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{activeQuiz.questions.length} questions</span>
            {activeQuiz.timeLimit && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeQuiz.timeLimit} min
              </span>
            )}
            {activeQuiz.tutor && (
              <span>
                By {activeQuiz.tutor.firstName} {activeQuiz.tutor.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white border rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              {result.percentage}%
            </h2>
            <p className="text-gray-600 mt-1">
              You scored {result.score} out of {result.totalQuestions}
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.percentage >= 70
                      ? "bg-green-500"
                      : result.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${result.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {activeQuiz.questions.map((q, qIndex) => {
            const resultAnswer = result?.answers?.[qIndex];
            return (
              <div
                key={qIndex}
                className="bg-white border rounded-xl p-5 space-y-3"
              >
                <p className="font-medium text-gray-900">
                  <span className="text-blue-600 mr-2">Q{qIndex + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = answers[qIndex] === oIndex;
                    let optionClass = "border-gray-200 hover:border-blue-300";

                    if (result) {
                      if (resultAnswer?.correctAnswer === oIndex) {
                        optionClass = "border-green-500 bg-green-50";
                      } else if (isSelected && !resultAnswer?.isCorrect) {
                        optionClass = "border-red-500 bg-red-50";
                      }
                    } else if (isSelected) {
                      optionClass = "border-blue-500 bg-blue-50";
                    }

                    return (
                      <button
                        key={oIndex}
                        type="button"
                        onClick={() => !result && handleAnswer(qIndex, oIndex)}
                        disabled={!!result}
                        className={`w-full text-left px-4 py-2.5 border rounded-lg text-sm transition-colors ${optionClass} ${
                          result ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span className="font-medium text-gray-500 mr-2">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        {opt}
                        {result && resultAnswer?.correctAnswer === oIndex && (
                          <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-lg"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
      <p className="text-gray-500">
        Test your knowledge with quizzes created by tutors
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No quizzes available yet
          </h2>
          <p className="text-gray-400 mt-2">
            Tutors will create quizzes for you to practice with
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{quiz.questions?.length || 0} questions</span>
                    {quiz.subject && <span>{quiz.subject.name}</span>}
                    {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
                    {quiz.tutor && (
                      <span>
                        By {quiz.tutor.firstName}
                      </span>
                    )}
                  </div>
                </div>
                {quiz.attempted && (
                  <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Completed
                  </span>
                )}
              </div>

              {quiz.myAttempts?.length > 0 && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  Best score:{" "}
                  <span className="font-semibold">
                    {Math.max(
                      ...quiz.myAttempts.map(
                        (a) => Math.round((a.score / a.totalQuestions) * 100)
                      )
                    )}
                    %
                  </span>
                </div>
              )}

              <button
                onClick={() => startQuiz(quiz)}
                className="mt-3 w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                {quiz.attempted ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuizPage;
