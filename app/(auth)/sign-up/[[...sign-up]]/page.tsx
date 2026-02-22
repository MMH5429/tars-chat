import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">TARS Chat</h1>
          <p className="text-gray-400">Create an account to get started</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
