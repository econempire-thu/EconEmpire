import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase.config.js";
import { doc, setDoc } from "firebase/firestore";
import { sendEmailVerification, signOut } from "firebase/auth";
import SystemButton from "../components/SystemButton.jsx";
import AlertPopup from "../components/AlertPopup.jsx";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlertIC, setShowAlertIC] = useState(false);
  const [showAlertPMM, setShowAlertPMM] = useState(false);
  const [showAlertTHUER, setShowAlertTHUER] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  // We don't want automatic navigation after registration
  // Instead, we'll handle it manually in handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      setShowAlertPMM(true);
      return;
    }

    if (!email.endsWith("thu.de")) {
      setAlertMessage("A THU email is required. Please try again.");
      setShowAlertTHUER(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        email,
        password,
      );

      if (!userCredential) {
        setAlertMessage("Registration failed. Please try again.");
        setShowAlertIC(true);
        return;
      }

      // Create a user document in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(
        userDocRef,
        {
          villageAssigned: false,
          role: "student",
          name: name,
          email: email,
          isWaiting: true,
          createdAt: Date.now(),
        },
        { merge: true },
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Success, clear fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Show verification message
      setAlertMessage(
        "Account created successfully! Please check your email to verify your account before logging in.",
      );
      setShowAlertIC(true);

      // Sign out the user
      await signOut(auth);

      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setAlertMessage("Email already in use. Please try another email.");
      } else if (err.code === "auth/weak-password") {
        setAlertMessage(
          "Password is too weak. Please use at least 6 characters.",
        );
      } else {
        setAlertMessage("Registration failed: " + err.message);
      }
      setShowAlertIC(true);
      console.error("Error:", err);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden items-center justify-center bg-stone-950 select-none px-5 font-default">
      <h1 className={`font-telma-medium text-5xl text-stone-50`}>
        Econ Empire
      </h1>

      {showAlertIC && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setShowAlertIC(false)}
        />
      )}

      {showAlertPMM && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setShowAlertPMM(false)}
        />
      )}
      {showAlertTHUER && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setShowAlertTHUER(false)}
        />
      )}

      <div className={`mt-10 p-6 bg-stone-900 w-full max-w-lg rounded-xl`}>
        <form className={`flex flex-col`} onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4 bg-stone-800 rounded-lg px-3 py-2">
            <label className="block text-sm md:text-base text-stone-300">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>
          {/* Email Input */}
          <div className="mb-4 bg-stone-800 rounded-lg px-3 py-2">
            <label
              htmlFor="email"
              className="block text-sm md:text-base text-stone-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="example@mail.com"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4 bg-stone-800 rounded-lg px-3 py-2">
            <label
              htmlFor="password"
              className="block text-sm md:text-base text-stone-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {/* Removed resend verification button as it's not needed in the new flow */}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6 bg-stone-800 rounded-lg px-3 py-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm md:text-base text-stone-300"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <div className={`flex justify-between w-full`}>
            <SystemButton
              onClick={() => navigate("/login")}
              type="button"
              label={"Back to Login"}
            />
            <SystemButton type="submit" disabled={loading} label={"Register"} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
