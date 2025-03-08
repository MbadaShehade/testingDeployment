'use client';

import { useRouter } from 'next/navigation';

export default function LoggedInPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have successfully logged in to your account.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}