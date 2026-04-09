import { useState } from "react";
import AuthIntro from "../../components/auth/AuthIntro";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AuthLayout from "../../layouts/AuthLayout";
import useLogin from "../../hooks/auth/useLogin";
import ErrorAlert from "../../components/common/ErrorAlert";
import { Link } from "react-router-dom";
import { useCooldown } from "../../hooks/auth/useCooldown";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const {
    isPending,
    loginMutation,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  } = useLogin();

  const { label, isActive, formattedTime } = useCooldown(retryAfter);

  const handleLogin = (e) => {
    e.preventDefault();

    // if (isActive) return;

    clearErrors();
    setRetryAfter(null);
    loginMutation(credentials);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col justify-center space-y-8 md:space-y-1">
        <AuthIntro
          heading="Welcome Back"
          subText="Don't have an account?"
          linkText="Sign up"
          linkTo="/signup"
        />{" "}
        <ErrorAlert error={generalError} />
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && (
            <span className="text-error text-xs mt-1">{fieldErrors.email}</span>
          )}
          <Input
            label="Password"
            name="password"
            placeholder="Enter your password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          {fieldErrors.password && (
            <span className="text-error text-xs mt-1">
              {fieldErrors.password}
            </span>
          )}

          {/* <div className="flex items-center mb-4"> */}
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
          {/* </div> */}

          <Button
            type="submit"
            disabled={isPending || isActive}
            loading={isPending}
          >
            {isPending
              ? "Logging in..."
              : isActive
              ? `Wait ${formattedTime} ${label} to retry`
              : "Log In"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
