import { AuthFooter, AuthShell, PrimaryButton } from "../auth-ui";

export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow="One last step"
      title="Verify your email"
      description="We sent a six-digit verification code to your email. Enter it below to activate your I-RAS Styles account."
    >
      <form className="space-y-5">
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <input
              key={item}
              aria-label={`Verification digit ${item + 1}`}
              inputMode="numeric"
              maxLength={1}
              className="h-12 min-w-0 rounded-md border border-slate-200 bg-white text-center text-lg font-bold text-[#17175c] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          ))}
        </div>
        <PrimaryButton>Verify email</PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Didn’t receive the code?{" "}
        <button className="font-bold text-indigo-700 hover:underline">
          Resend code
        </button>
      </p>
      <AuthFooter
        prompt="Wrong email address?"
        href="/register"
        action="Go back"
      />
    </AuthShell>
  );
}
