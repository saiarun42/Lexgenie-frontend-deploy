import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Lex Genie",
  description: "Create your Lex Genie account",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 