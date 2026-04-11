import React, { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import AuthIntro from "../../components/auth/AuthIntro";
import Input from "../../components/ui/Input";
import PasswordStrengthMeter from "../../components/auth/PasswordStrengthMeter";
import useSignUp from "../../hooks/auth/useSignup";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useCooldown } from "../../hooks/auth/useCooldown";

const SignupPage = () => {
  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const {
    isPending,
    signupMutation,
    fieldErrors,
    generalError,
    clearErrors,
    retryAfter,
    setRetryAfter,
  } = useSignUp();

  const { label, isActive, formattedTime } = useCooldown(retryAfter);

  const handleSignup = (e) => {
    if (isActive) return;
    e.preventDefault();

    clearErrors();
    setRetryAfter(null);
    signupMutation(credentials);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <AuthLayout>
      <div className="flex flex-col justify-center space-y-5 md:space-y-1">
        <AuthIntro
          heading="Welcome To Peerup"
          subText="Already have an account?"
          linkText="Log In"
          linkTo="/login"
        />
        <ErrorAlert error={generalError} />

        <form onSubmit={handleSignup} className="space-y-6 md:space-y-5">
          <Input
            label="First Name"
            name="firstName"
            placeholder={"Enter your First Name"}
            value={credentials.firstName}
            onChange={handleChange}
            required
          />
          {fieldErrors.firstName && (
            <span className="text-error text-xs mt-1">
              {fieldErrors.firstName}
            </span>
          )}
          <Input
            label="Last Name"
            name="lastName"
            placeholder={"Enter your Last Name"}
            value={credentials.lastName}
            onChange={handleChange}
            required
          />
          {fieldErrors.lastName && (
            <span className="text-error text-xs mt-1">
              {fieldErrors.lastName}
            </span>
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder={"Enter your email"}
            value={credentials.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && (
            <span className="text-error text-xs mt-1">{fieldErrors.email}</span>
          )}
          <Input
            label="Password"
            type="password"
            placeholder={"Enter your password"}
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          {fieldErrors.password && (
            <span className="text-error text-xs mt-1">
              {fieldErrors.password}
            </span>
          )}
          {/* <PasswordStrengthMeter password={credentials.password} /> */}

          <Button
            type="submit"
            disabled={isPending || isActive}
            loading={isPending}
          >
            {isPending
              ? "Loading..."
              : isActive
              ? `Wait ${formattedTime} ${label} to retry`
              : "Create Account"}
          </Button>
          <div className="text-center">
            <p className="text-xs">
              By creating an account you agree to our <br />
              <span className="text-primary font-bold hover:underline">
                Terms of Use
              </span>{" "}
              &{" "}
              <span className="text-primary font-bold hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
