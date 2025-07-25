import NavBar from "../components/Navbar.jsx";
import StartButton from "../components/StartButton.jsx";
import { useEffect, useState } from "react";
import VillageGreeting from "../components/VillageGreeting.jsx";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase.config.js";
import { doc, setDoc } from "firebase/firestore";
import bg from "../assets/backgrounds/start_card_bg_green_upscaled.jpg";
import {
  getMaxLevelAllowed,
  getUserField,
} from "../utils/firebase/Firestore.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../components/Loading.jsx";
import AlertPopup from "../components/AlertPopup.jsx";

function App() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [user, loadingAuth] = useAuthState(auth);
  const [showDialog, setShowDialog] = useState(false); // Manage dialog visibility
  const [newVillageName, setNewVillageName] = useState(""); // New village name input
  const [villageName, setVillageName] = useState("");
  const [level, setLevel] = useState(1);
  const [turn, setTurn] = useState(1);
  const [maxLevelAllowed, setMaxLevelAllowed] = useState(1);
  const [levelReached, setLevelReached] = useState(1);
  const [showAlert, setShowAlert] = useState(false);

  const handleStartGame = () => {
    if (levelReached <= maxLevelAllowed) {
      navigate(`/game?level=${level}&turn=${turn}`);
    } else {
      setShowAlert(true);
    }
  };

  const handleSubmit = async () => {
    if (newVillageName.trim()) {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid); // Create reference to user's document

          // Set villageName field in the user's document
          await setDoc(
            userDocRef,
            { villageName: newVillageName, victoryPoints: 0, levelReached: 1 },
            { merge: true },
          );

          setNewVillageName(newVillageName);
          setShowDialog(false); // Close the dialog
        } else {
          setError("No user logged in.");
        }
      } catch (error) {
        setError("Error saving village name: " + error.message);
      }
    } else {
      setError("Village name cannot be empty.");
    }
  };

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/");
    }
  }, [user, loadingAuth]);

  const loadData = async (user) => {
    // Check if user is in waiting list
    const isWaiting = await getUserField("isWaiting", false, user);
    const villageAssigned = await getUserField("villageAssigned", false, user);

    if (isWaiting && !villageAssigned) {
      // Redirect to waiting room if user is in waiting list
      navigate("/waiting-room");
      return;
    }

    const villageName = await getUserField(
      "villageName",
      "Error fetching village name",
      user,
    );
    if ("Error fetching village name".includes(villageName)) {
      setShowDialog(true);
    } else {
      setVillageName(villageName);
      const level = await getUserField("levelReached", 1, user);
      setLevelReached(level);
      setLevel(Math.floor((level - 1) / 10) + 1);
      setTurn(((level - 1) % 10) + 1);

      const maxLevelAllowed = await getMaxLevelAllowed(user);
      setMaxLevelAllowed(maxLevelAllowed);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user);
      } else {
        // If user is not authenticated, navigate to welcome page
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loadingAuth) {
    return <Loading />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-default">
      {showAlert && (
        <AlertPopup
          message="This level and turn is locked by your teacher, wait for them to unlock it."
          onClose={() => setShowAlert(false)}
        />
      )}
      {showDialog && (
        <div className="fixed z-11 inset-0 flex items-center justify-center bg-stone-950/40 backdrop-blur-xl">
          <div className="bg-stone-900 p-6 rounded-2xl shadow-xl max-w-2xl w-full mx-5">
            <h2 className="md:text-lg lg:text-2xl text-stone-50 mb-4 font-medium text-center">
              Choose a name for your village
            </h2>
            <input
              type="text"
              value={newVillageName}
              onChange={(e) => {
                setNewVillageName(e.target.value);
              }}
              placeholder="Enter village name"
              className="w-full px-4 py-2 bg-stone-800 rounded-lg text-stone-300 focus:outline-none focus:ring focus:ring-stone-400 font-regular"
            />
            {error && (
              <p className="text-red-300 mt-1.5 tracking-wide text-sm font-light">
                {error}
              </p>
            )}
            <div className="flex justify-end space-x-2 mt-2 text-sm md:text-base font-medium">
              <button
                onClick={handleSubmit}
                className="cursor-pointer bg-white text-black py-2 px-4 rounded-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      <NavBar currentPage={"Home"} />
      <div className={`pt-20 relative h-dvh`}>
        <img
          src={bg}
          className="absolute inset-0 object-cover bg-center w-full h-full"
          alt="background"
        />
        <div className="absolute inset-0 bg-black/85" />
        <div className="relative flex flex-col px-10 h-full py-10 items-center justify-between z-10">
          <VillageGreeting villageName={villageName} />
          <StartButton
            className={``}
            onClick={handleStartGame}
            label={`Start Level ${level} Turn ${turn}`}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
