import { useState } from "react";
import logo from "../../assets/logo/PeerubLogo.svg";
import checkmark from "../../assets/images/auth/checkmark-green.svg";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import useForgotPassword from "../../hooks/auth/useForgotPassword";
import ErrorAlert from "../../components/common/ErrorAlert";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import { useCooldown } from "../../hooks/auth/useCooldown";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const {
    forgotPasswordMutation,
    isPending,
    fieldErrors,
    generalError,
    clearErrors,
    isSuccess,
    retryAfter,
    setRetryAfter,
  } = useForgotPassword();

  const { label, isActive, formattedTime } = useCooldown(retryAfter);

  const handleSubmit = (e) => {
    if (isActive) return;
    e.preventDefault();

    clearErrors();
    setRetryAfter(null);
    forgotPasswordMutation({ email });
  };
  return (
    <>
      <AuthLayout>
        {/* FORM */}
        {!isSuccess && (
          <div className="space-y-4">
            <div className=" flex flex-col items-center justify-center gap-2 ">
              <img src={logo} alt="Peerhub" />
              <h2 className="text-2xl font-semibold text-center mb-3 text-black">
                Forgot Password{" "}
              </h2>
              {generalError && <ErrorAlert error={generalError} />}
              <p className="text-m ">
                Enter your email address and we'll send you a link to reset your
                password.{" "}
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3">
                <div className="form-control w-full space-y-2">
                  <input
                    type="email"
                    placeholder="hello@example.com"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {fieldErrors.email && (
                    <span className="text-red-500 text-sm">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isPending || isActive}
                  loading={isPending}
                >
                  {isPending
                    ? "Sending link..."
                    : isActive
                    ? `Wait ${formattedTime} ${label} to retry`
                    : "Send Reset Link"}
                </Button>

                <div className=" ">
                  <Link
                    to="/login"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1 " /> Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        )}
        {/* SUCCESS MESSAGE */}
        {isSuccess && (
          <div className="items-center flex flex-col space-y-4">
            <img src={checkmark} alt="Peerhub" />
            <p className="text-base-content text-center">
              If an account exists for{" "}
              <span className="font-semibold">{email}</span>, you will receive a
              password reset link shortly.
            </p>
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;
