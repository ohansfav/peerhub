import logo from "../../assets/logo/PeerubLogo.svg";
import checkmark from "../../assets/images/auth/checkmark-green.svg";
import { useEffect, useRef, useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useVerifyEmail from "../../hooks/auth/useVerifyEmail";
import ErrorAlert from "../../components/common/ErrorAlert";
import { resendVerificationEmail } from "../../lib/api/auth/authApi";
import { useCooldown } from "../../hooks/auth/useCooldown";

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef([]);

  const [feedback, setFeedback] = useState(null);
  const [resendRetryAfter, setResendRetryAfter] = useState(null);

  const handleChange = (index, value) => {
    const newCode = [...verificationCode];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setVerificationCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setVerificationCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => {
      setFeedback("Verification email sent successfully!");
      setResendRetryAfter(null);
    },
    onError: (error) => {
      // Handle rate limiting error
      const errorRetryAfter = error?.response?.data?.retryAfter;
      if (errorRetryAfter) {
        setResendRetryAfter(errorRetryAfter);
      }

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.";
      setFeedback(message);
    },
  });

  const {
    verifyEmailMutation,
    fieldErrors,
    generalError,
    clearErrors,
    isPending,
    isSuccess,
    setRetryAfter,
    retryAfter: verifyRetryAfter,
    invalidateQuery,
  } = useVerifyEmail();

  const {
    label: resendLabel,
    isActive: resendIsActive,
    formattedTime: resendFormatTime,
  } = useCooldown(resendRetryAfter);

  const {
    label: verifyLabel,
    isActive: verifyIsActive,
    formattedTime: verifyFormatTime,
  } = useCooldown(verifyRetryAfter);

  const handleSubmit = async (e) => {
    if (verifyIsActive) return;

    e.preventDefault();
    clearErrors();
    setRetryAfter(null);
    const code = verificationCode.join("");
    verifyEmailMutation({ code });
  };

  const handleResendCode = async () => {
    if (resendIsActive) return;

    setFeedback(null);
    setResendRetryAfter(null);
    resendVerificationMutation.mutate();
  };

  const handleContinue = async () => {
    await invalidateQuery();
    navigate("/role-selection");
  };

  // Auto submit when all fields are filled
  useEffect(() => {
    if (verificationCode.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [verificationCode]);

  return (
    <AuthLayout>
      {!isSuccess ? (
        <div className=" flex flex-col max-w-2xl mx-auto  overflow-hidden p-5">
          <div className="mb-4 flex flex-col items-center justify-center gap-2 ">
            <img src={logo} alt="Peerup" />
            <h2 className="text-2xl font-semibold text-center mb-1 text-black">
              Verify Your Email
            </h2>
            {generalError && <ErrorAlert error={generalError} />}
            <p className="text-m ">
              Enter the 6-digit code sent to your email address.
            </p>
          </div>
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-3">
              <div className="flex justify-between">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleChange(index, val);
                    }}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-2xl font-semibold text-black border-2 border-gray-600 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                ))}
              </div>

              {/* Error alert */}

              {fieldErrors && (
                <p className="text-error text-xs">{fieldErrors.code}</p>
              )}

              <Button
                onClick={handleSubmit}
                type="submit"
                disabled={isPending || verifyIsActive}
                loading={isPending}
              >
                {isPending
                  ? "Verifying..."
                  : verifyIsActive
                  ? `Wait ${verifyFormatTime} ${verifyLabel} to retry`
                  : "Verify Email"}
              </Button>
            </form>
          </div>
          <div>
            <p className="text-sm text-center mt-4">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendCode}
                disabled={
                  resendVerificationMutation.isPending || resendIsActive
                }
                className={`font-semibold ${
                  resendIsActive || resendVerificationMutation.isPending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-primary hover:underline"
                }`}
              >
                {resendVerificationMutation.isPending
                  ? "Sending..."
                  : resendIsActive
                  ? `Resend in ${resendFormatTime} ${resendLabel}`
                  : "Resend Code"}
              </button>
            </p>
            {feedback && (
              <p
                className={`mt-1 text-sm text-center ${
                  resendVerificationMutation.isError
                    ? "text-red-500"
                    : "text-blue-400"
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-5 space-y-2">
          <img src={checkmark} alt="Peerup" className="mb-4" />
          <p className="text-center">Your email address has been verified </p>
          <h2 className="text-4xl font-bold text-black-300 text-center mb-4">
            Let’s set up your account
          </h2>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      )}
    </AuthLayout>
  );
};

export default EmailVerificationPage;
