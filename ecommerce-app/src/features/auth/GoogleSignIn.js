import React, { useEffect, useState } from 'react';

const GoogleSignIn = ({ onSuccess, onError, isLoading, setIsLoading, buttonText = "Continue with Google" }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Function to initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        console.log('Initializing Google Sign-In with client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            console.log('Google callback received');
            try {
              setIsLoading(true);
              await onSuccess(response.credential);
            } catch (err) {
              console.error('Google auth error:', err);
              onError(err.message || "Google authentication failed");
            } finally {
              setIsLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setIsGoogleLoaded(true);
        console.log('Google Sign-In initialized successfully');
      }
    };

    // Check if Google API is already loaded
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google API to load
      const checkGoogleAPI = setInterval(() => {
        if (window.google && window.google.accounts) {
          initializeGoogleSignIn();
          clearInterval(checkGoogleAPI);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleAPI);
        // Optionally, you can show an error if Google API fails to load
      }, 10000);

      return () => clearInterval(checkGoogleAPI);
    }
  }, [onSuccess, onError, setIsLoading]);

  const handleGoogleSignIn = () => {
    if (!isGoogleLoaded || !window.google || !window.google.accounts) {
      onError("Google Sign-In is not available. Please refresh the page.");
      return;
    }
    try {
      console.log('Prompting Google Sign-In...');
      const promptResult = window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.error('Google Sign-In prompt error:', notification);
          onError("Google Sign-In is not available. Please check your browser settings.");
        }
      });
      console.log('Prompt result:', promptResult);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      onError("Failed to start Google Sign-In. Please try again.");
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading || !isGoogleLoaded}
      className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Signing in...' : buttonText}
    </button>
  );
};

export default GoogleSignIn; 