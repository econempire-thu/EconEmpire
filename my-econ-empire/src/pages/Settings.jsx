import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar.jsx";
import bg from "../assets/backgrounds/start_card_bg_green_upscaled.jpg";
import SystemButton from "../components/SystemButton.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";
import {
  getLevelData,
  getRegionName,
  getUserField,
} from "../utils/firebase/Firestore.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [regionName, setRegionName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [villageLetter, setVillageLetter] = useState("");

  const handleLogOut = async () => {
    try {
      logout();
      navigate("/log-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const loadData = async (user) => {
    const regionNameDB = await getRegionName(user);
    setRegionName(regionNameDB);
    const userNameDB = await getUserField("name", "", user);
    setUserName(userNameDB);
    const villageNameDB = await getUserField("villageName", "", user);
    setVillageName(villageNameDB);
    const emailDB = await getUserField("email", "", user);
    setEmail(emailDB);
    const villageLetterDB = await getUserField("villageLetter", "", user);
    setVillageLetter(villageLetterDB);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user);
      } else {
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-default">
      <NavBar currentPage={"Settings"} />
      <div className="pt-20 relative h-screen">
        <img
          src={bg}
          className="absolute inset-0 object-cover bg-center w-full h-full"
          alt="background"
        />
        {/* Foreground Black Overlay */}
        <div className="absolute inset-0 bg-black/85" />

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-between px-10 h-full py-10 z-10">
          {/* Profile Card */}
          <div className="bg-stone-800/30 border border-stone-700 rounded-3xl p-6 w-full max-w-md text-stone-100 mb-10 shadow-xl backdrop-blur-3xl">
            {/* Profile Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-stone-700 text-white flex items-center justify-center text-xl font-bold shadow-inner">
                {getInitials(userName)}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-center">
              Your Profile
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-stone-400">Name:</span>
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Region:</span>
                <span className="font-medium">{regionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Village Name:</span>
                <span className="font-medium">{villageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Village Type:</span>
                <span className="font-medium">{villageLetter}</span>
              </div>
            </div>
          </div>

          <SystemButton label={`Logout`} onClick={handleLogOut} />
        </div>
      </div>
    </div>
  );
}

export default Settings;
