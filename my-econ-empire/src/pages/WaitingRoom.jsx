import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase.config.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, signOut } from "firebase/auth";
import { getUserField } from "../utils/firebase/Firestore.jsx";
import Loading from "../components/Loading.jsx";
import SystemButton from "../components/SystemButton.jsx";
import { LogOut } from "lucide-react";

function WaitingRoom() {
  const navigate = useNavigate();
  const [user, loadingAuth] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [villageName, setVillageName] = useState("");
  const [statusMessage, setStatusMessage] = useState("Awaiting approval...");

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/log-in");
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchInitialData = async () => {
      try {
        const isWaiting = await getUserField("isWaiting", false, user);
        const villageAssigned = await getUserField(
          "villageAssigned",
          false,
          user,
        );

        if (!isWaiting || villageAssigned) {
          navigate("/home");
          return;
        }

        setEmail(user.email || "");
        const vName = await getUserField("villageName", "", user);
        setVillageName(vName);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time listener for changes to the user's document
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.villageAssigned) {
          // User has been assigned a village, redirect to home
          navigate("/home");
        }
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      // Clear waiting status in Firebase before logging out
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            isWaiting: false,
          },
          { merge: true },
        );
      }
      await signOut(auth);
      navigate("/log-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || loadingAuth) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col font-default w-screen h-screen overflow-hidden items-center justify-center bg-stone-950 select-none p-5">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>

      <div className="max-w-3xl w-full flex flex-col items-center">
        <h1 className="font-telma-medium text-4xl md:text-5xl text-stone-50 mb-6">
          Waiting Room
        </h1>

        <div className="w-full bg-stone-900 rounded-2xl p-6 md:p-8 border border-stone-700 shadow-lg">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-700">
              <div>
                <h2 className="text-stone-300 font-medium">Village Name</h2>
                <p
                  className={`text-xl md:text-2xl ${villageName ? "text-stone-50" : "text-stone-400 italic"}`}
                >
                  {villageName || "Yet to be set"}
                </p>
              </div>
              <div className="px-4 py-2 bg-emerald-900/40 rounded-lg border border-emerald-700/40 text-emerald-400">
                <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                Waiting for approval
              </div>
            </div>

            <div className="bg-stone-800 rounded-xl p-4">
              <h3 className="text-stone-400 mb-1">Account</h3>
              <p className="text-stone-50 break-all">{email}</p>
            </div>

            <div className="bg-stone-800/50 rounded-xl p-5 mt-4 border border-stone-700/50">
              <h3 className="text-lg text-stone-300 mb-3 flex items-center">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                Status
              </h3>
              <p className="text-stone-400">
                Your account is pending approval by a teacher. Once approved,
                you'll be automatically redirected to your village. Please keep
                this page open or check back later.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-stone-500 text-sm mb-4">
                If you believe there's an issue with your account, please
                contact your teacher.
              </p>
              <SystemButton onClick={handleLogout} label="Log Out" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitingRoom;
