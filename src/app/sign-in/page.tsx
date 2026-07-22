import { SignInForm } from "@/app/sign-in/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <section className="auth-page" aria-labelledby="sign-in-heading">
      <div className="auth-intro">
        <p className="page-label">Private pilot</p>
        <h1 id="sign-in-heading">Sign in to the player workspace</h1>
        <p>
          Review private clips, player evidence, and reports with your secure
          Pinpoint AI account.
        </p>
      </div>

      <div className="surface auth-panel">
        <header>
          <h2>Welcome back</h2>
          <p>Use the email and password assigned to your pilot account.</p>
        </header>
        <SignInForm nextPath={nextPath} />
      </div>
    </section>
  );
}

function sanitizeNextPath(value: string | string[] | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/players";
  }

  return value;
}
