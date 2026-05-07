import AuthGuard from "../../components/AuthGuard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
