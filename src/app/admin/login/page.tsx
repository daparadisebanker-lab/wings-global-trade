import { login } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brown-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brown-900">
            Admin Portal Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={login}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-brown-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-brown-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Password"
              />
            </div>
          </div>

          {searchParams.error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{searchParams.error}</p>
          )}

          <div>
            <SubmitButton>Sign in</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
