import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError("Failed to sign in with Google");
      console.error("Google sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithApple();
    } catch (error) {
      setError("Failed to sign in with Apple");
      console.error("Apple sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Mock API Creator
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
            Sign in to access your mock APIs
          </p>
        </div>

        {error && (
          <div className='p-3 bg-red-100 text-red-700 rounded-md text-sm'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className='w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
          >
            <svg
              width='18'
              height='18'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 48 48'
            >
              <path
                fill='#FFC107'
                d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
              />
              <path
                fill='#FF3D00'
                d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
              />
              <path
                fill='#4CAF50'
                d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
              />
              <path
                fill='#1976D2'
                d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
              />
            </svg>
            Sign in with Google
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className='w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
          >
            <svg
              width='18'
              height='18'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
            >
              <path
                d='M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.18 15.89 3.07 9.83 8.42 9.56c1.17.06 2 .45 2.75.46.93-.03 1.77-.46 2.88-.46 3.85.26 5.5 3.68 5 6.71-1.8 1.17-3.67 3.16-2 4.01zm-1.84-14.63C13.96 3.5 11.03 5.25 10.5 7.25c2.69.08 5.02-1.75 4.71-3.6z'
                fill='currentColor'
              />
            </svg>
            Sign in with Apple
          </button>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
