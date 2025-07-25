import NavBarItem from "./NavBarItem.jsx";
import Score from "./Score.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserField } from "../utils/firebase/Firestore.jsx";
import { Menu, X } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function NavBar({ currentPage }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [score, setScore] = useState(0);

  const getScore = async (user) => {
    const vp = await getUserField("victoryPoints", 0, user);
    setScore(vp);
  };
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getScore(user);
      } else {
        // If user is not authenticated, navigate to login
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <nav
      className={`fixed w-full z-50 bg-black/50 backdrop-blur-xl ${isMenuOpen ? "h-full" : ""}`}
    >
      <div className="mx-auto px-5">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu Button + Title */}
          <div className="flex items-center">
            <button
              className="md:hidden text-white mr-3"
              onClick={() => {
                console.log("Menu open state:", !isMenuOpen);
                setMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? (
                <X size={28} className="text-white" />
              ) : (
                <Menu size={28} className="text-white" />
              )}
            </button>

            <span className="text-lg lg:text-2xl font-telma-medium text-white">
              Econ Empire
            </span>
          </div>

          {/* Center: Nav Links (Hidden on Mobile) */}
          <div className="hidden md:flex space-x-6">
            <NavBarItem
              onClick={() => navigate("/")}
              label="Home"
              selected={currentPage === "Home"}
            />
            <NavBarItem
              onClick={() => navigate("/leaderboard")}
              label="Leaderboard"
              selected={currentPage === "Leaderboard"}
            />
            <NavBarItem
              onClick={() => navigate("/settings")}
              label="Settings"
              selected={currentPage === "Settings"}
            />
          </div>

          {/* Right: Score (Visible on all screen sizes) */}
          <Score score={score} />
        </div>
      </div>
      {/* Mobile Full-Screen Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex flex-col items-center justify-center space-y-6 md:hidden">
          <NavBarItem
            onClick={() => {
              navigate("/");
              setMenuOpen(false);
            }}
            label="Home"
            selected={currentPage === "Home"}
          />
          <NavBarItem
            onClick={() => {
              navigate("/leaderboard");
              setMenuOpen(false);
            }}
            label="Leaderboard"
            selected={currentPage === "Leaderboard"}
          />
          <NavBarItem
            onClick={() => {
              navigate("/settings");
              setMenuOpen(false);
            }}
            label="Settings"
            selected={currentPage === "Settings"}
          />
        </div>
      )}
    </nav>
  );
}
