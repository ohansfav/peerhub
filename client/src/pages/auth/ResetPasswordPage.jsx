import { useState } from "react";
import logo from "../../assets/logo/PeerubLogo.svg";

import { useParams } from "react-router";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import useResetPassword from "../../hooks/auth/useResetPassword";
import ErrorAlert from "../../components/common/ErrorAlert";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import { useCooldown } from "../../hooks/auth/useCooldown";
import Input from "../../components/ui/Input";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token } = useParams();

  const {
    resetPasswordMutation,
    fieldErrors,
    error,
    clearErrors,
    isPending,
    retryAfter,
    setRetryAfter,
  } = useResetPassword();

  const { label, isActive, formattedTime } = useCooldown(retryAfter);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isActive) return;

    clearErrors();
    setRetryAfter(null);
    if (password !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    resetPasswordMutation({ token, password });
  };

  return (
    <AuthLayout>
      <div className=" flex flex-col items-center justify-center gap-2 mb-5 ">
        <img src={logo} alt="Peerhub" />
        <h2 className="text-xl font-semibold  text-start">Reset Password</h2>
      </div>
      {error && <ErrorAlert error={error} />}
      <div className="w-full">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="flex flex-col gap-2">
                <div className="form-control w-full space-y-1">
                  <Input
                    name="password"
                    placeholder="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {fieldErrors.password && (
                    <span className="text-red-500 text-sm">
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
                <div className="form-control w-full space-y-2">
                  <Input
                    name="password"
                    placeholder="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending || isActive}
                  loading={isPending}
                >
                  {isPending
                    ? "Resetting..."
                    : isActive
                    ? `Wait ${formattedTime} ${label} to retry`
                    : "Set New Password"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
