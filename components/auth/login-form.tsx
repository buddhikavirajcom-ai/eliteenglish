"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.76-.07-1.49-.2-2.2H12v4.16h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.6Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.91.61-2.08.98-3.47.98-2.67 0-4.93-1.8-5.74-4.22H2.84v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.73A5.98 5.98 0 0 1 5.94 12c0-.6.11-1.17.32-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.37l3.2-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.05c1.5 0 2.84.51 3.9 1.52l2.92-2.92C17.07 2.98 14.75 2 12 2A10 10 0 0 0 3.06 7.63l3.2 2.64c.8-2.42 3.07-4.22 5.74-4.22Z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LoginFormProps {
  googleEnabled?: boolean;
}

export function LoginForm({ googleEnabled = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<{ identifier: string; password: string }>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const response = await signIn("credentials", {
        redirect: false,
        callbackUrl,
        identifier: values.identifier,
        password: values.password
      });

      if (!response || response.error) {
        setError("root", {
          message: "Invalid credentials. Try the seeded teacher or student account."
        });
        return;
      }

      router.push(response.url ?? callbackUrl);
      router.refresh();
    });
  });

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      await signIn("google", { callbackUrl });
    });
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {googleEnabled ? (
        <div className="space-y-3">
          <Button
            className="w-full justify-center border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={isPending || isGooglePending}
            onClick={handleGoogleSignIn}
            type="button"
            variant="outline"
          >
            {isGooglePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            {isGooglePending ? "Opening Google..." : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or sign in with password
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </div>
      ) : null}

      <FormField label="Email or phone" htmlFor="identifier" error={errors.identifier?.message} required>
        <Input id="identifier" placeholder="admin@lms.local or 0771234567" {...register("identifier")} />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
        <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
      </FormField>

      {errors.root?.message ? <InlineAlert tone="error" title={errors.root.message} /> : null}

      <Button className="w-full" disabled={isPending || isGooglePending} type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <div className="subtle-panel p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Sign-in options</p>
        <p className="mt-2">
          {googleEnabled
            ? "Use Google for a faster login, or continue with your existing teacher or student account."
            : "Use your existing teacher or student account. Add Google client credentials in the environment to enable Google sign-in."}
        </p>
        <p className="mt-3">Demo teacher: `admin@lms.local` / `admin123`</p>
        <p>Demo student: `0771234567` / `student123`</p>
      </div>
    </form>
  );
}
