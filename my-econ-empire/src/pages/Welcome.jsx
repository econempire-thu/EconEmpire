import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SystemButton from "../components/SystemButton.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../components/Loading.jsx";

function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is already authenticated, redirect to home
        navigate("/home");
      } else {
        // If not authenticated, show the welcome page
        setLoading(false);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden items-center justify-center bg-stone-950 select-none px-5 font-default">
      <h1 className="font-telma-medium text-5xl text-stone-50 mb-8">
        Econ Empire
      </h1>

      <div className="mt-6 p-8 bg-stone-900 w-full max-w-md rounded-xl flex flex-col items-center">
        <p className="text-stone-300 text-center mb-10">
          Welcome to Econ Empire, an economic strategy game. Please log in with
          your account or register if you're new.
        </p>

        <div className="flex flex-col w-full gap-4">
          <SystemButton
            onClick={() => navigate("/teacher-code")}
            type="button"
            label="Log In"
            className="w-full"
          />

          <SystemButton
            onClick={() => navigate("/register")}
            type="button"
            label="Register"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Welcome;
