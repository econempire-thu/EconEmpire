import React, { useEffect, useState } from "react";
import {
  useAuthState,
  useSignInWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth, db } from "../firebase.config.js";
import { useNavigate } from "react-router-dom";
import SystemButton from "../components/SystemButton.jsx";
import {
  fetchAndCacheUserData,
  getUserField,
  getVillageAssigned,
  useSetWaitingList,
} from "../utils/firebase/Firestore.jsx";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import AlertPopup from "../components/AlertPopup.jsx";
import { doc, setDoc } from "firebase/firestore";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setWaitingList = useSetWaitingList();
  const [showAlertIC, setShowAlertIC] = useState(false);
  const [showAlertVNA, setShowAlertVNA] = useState(false);
  const [showAlertFP, setShowAlertFP] = useState(false);
  const [showAlertES, setShowAlertES] = useState(false);
  const [showAlertEDNE, setShowAlertEDNE] = useState(false);
  const [showAlertEV, setShowAlertEV] = useState(false);
  const [showAlertTC, setShowAlertTC] = useState(false);
  const [userPassword, setUserPassword] = useState("");
  const [fetchedUser, setFetchedUser] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const [signInUserWithEmailAndPassword, loadingSignIn, errorSignIn] =
    useSignInWithEmailAndPassword(auth);
  const [user, loadingAuth] = useAuthState(auth);
  const [villageAssigned, setVillageAssigned] = useState(false);

  // Check for valid teacher code
  useEffect(() => {
    const validTeacherCode = sessionStorage.getItem("validTeacherCode");
    if (!validTeacherCode) {
      // No valid teacher code, redirect to teacher code page
      navigate("/teacher-code");
    }

    // Check for unverified email in session storage
    const storedUnverifiedEmail = sessionStorage.getItem("unverifiedEmail");
    if (storedUnverifiedEmail) {
      setUnverifiedEmail(storedUnverifiedEmail);
      setEmail(storedUnverifiedEmail);
      setShowAlertEV(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (!loadingAuth && user) {
      const checkUserStatus = async () => {
        const isWaiting = await getUserField("isWaiting", false, user);
        const villageAssigned = await getVillageAssigned(user);

        if (isWaiting && !villageAssigned) {
          navigate("/waiting-room");
        } else if (villageAssigned) {
          navigate("/home");
        }
      };

      checkUserStatus();
    }
  }, [user, loadingAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInUserWithEmailAndPassword(
        email,
        password,
      );

      if (!userCredential.user) {
        setShowAlertIC(true);
        return;
      }

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Store the email for resending verification
        setUnverifiedEmail(email);
        // Store the email for resending verification
        setUnverifiedEmail(email);
        // Store in session storage so it persists across page reloads
        sessionStorage.setItem("unverifiedEmail", email);
        // Sign out the user since email is not verified
        await signOut(auth);
        setShowAlertEV(true);
        setPassword("");
        return;
      } else {
        // If email is verified, clear any stored unverified email
        sessionStorage.removeItem("unverifiedEmail");
      }

      // Get the teacher ID from session storage
      const teacherId = sessionStorage.getItem("teacherId");

      // If we have a teacher ID, set it in the user document
      if (teacherId) {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await setDoc(
          userDocRef,
          {
            assignedBy: teacherId,
          },
          { merge: true },
        );
      }

      await fetchAndCacheUserData(db, userCredential.user);
      const villageAssigned = await getVillageAssigned(userCredential.user);
      const isWaiting = await getUserField(
        "isWaiting",
        false,
        userCredential.user,
      );
      setVillageAssigned(villageAssigned);

      if (!villageAssigned) {
        if (!isWaiting) {
          const userDocRef = doc(db, "users", userCredential.user.uid);
          await setDoc(
            userDocRef,
            {
              isWaiting: true,
            },
            { merge: true },
          );

          setShowAlertVNA(true);
        }
        // Redirect to waiting room
        navigate("/waiting-room");
        return;
      }

      // Successful login and village assigned
      setEmail("");
      setPassword("");
      navigate("/home");
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setShowAlertIC(true);
      } else if (err.code === "auth/user-not-found") {
        setShowAlertEDNE(true);
      } else {
        setShowAlertIC(true);
      }
      console.error("Error:", err);
    }
  };

  const sendEmailToStudent = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setShowAlertES(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setShowAlertEDNE(true);
      } else {
        console.error("Error:", err);
      }
    }
  };

  const resendVerificationEmail = async () => {
    try {
      // For security reasons, we need to create a temporary account to send the verification email
      // This is a workaround since we can't directly call sendEmailVerification without being logged in
      const tempEmail = unverifiedEmail;
      const tempPassword = password;

      // Attempt to sign in with the stored credentials
      const userCredential = await signInUserWithEmailAndPassword(
        tempEmail,
        tempPassword,
      );

      if (userCredential && userCredential.user) {
        // Send verification email
        await sendEmailVerification(userCredential.user);
        // Sign out the user
        await signOut(auth);

        // Alert that verification email was sent
        setShowAlertEV(false);
        setTimeout(() => {
          setShowAlertEV(true);
        }, 100);
      }
    } catch (err) {
      console.error("Error resending verification email:", err);
      // If we can't sign in, show error
      setShowAlertIC(true);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden items-center justify-center bg-stone-950 select-none px-5 font-default">
      <h1 className={`font-telma-medium text-5xl text-stone-50`}>
        Econ Empire
      </h1>
      {showAlertFP && (
        <AlertPopup
          message="Enter an email before clicking on Forgot Password."
          onClose={() => setShowAlertFP(false)}
        />
      )}
      {showAlertEDNE && (
        <AlertPopup
          message="Account with this email does not exist."
          onClose={() => setShowAlertEDNE(false)}
        />
      )}
      {showAlertES && (
        <AlertPopup
          message="Password reset link has been sent to your email. Please check your inbox."
          onClose={() => setShowAlertES(false)}
        />
      )}
      {showAlertVNA && (
        <AlertPopup
          message="You have been added to the waiting list, please wait for your teacher to assign you a village."
          onClose={() => setShowAlertVNA(false)}
        />
      )}
      {showAlertIC && (
        <AlertPopup
          message="Invalid Credentials"
          onClose={() => setShowAlertIC(false)}
        />
      )}
      {showAlertEV && (
        <AlertPopup
          message={
            <div>
              <p>
                Please verify your email before logging in. Check your inbox for
                the verification link.
              </p>
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resendVerificationEmail();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Resend Verification Email
                </button>
              </div>
            </div>
          }
          onClose={() => setShowAlertEV(false)}
        />
      )}

      <div className={`mt-10 p-6 bg-stone-900 w-full max-w-sm rounded-xl`}>
        <form className={`flex flex-col`} onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div
            onClick={() => {
              if (!email.trim()) {
                setShowAlertFP(true);
              } else {
                sendEmailToStudent(email);
              }
            }}
            className="w-full text-white cursor-pointer hover:underline text-end mb-6"
          >
            Forgot Password?
          </div>
          {/* Submit Button */}
          <div className={`flex justify-between w-full`}>
            <SystemButton
              onClick={() => navigate("/register")}
              type="button"
              label={"Register"}
            />
            <SystemButton
              type="submit"
              disabled={loadingSignIn}
              label={"Login"}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
