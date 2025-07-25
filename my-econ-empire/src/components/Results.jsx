import React, { useEffect, useState } from "react";
import {
  ANGRY_MULTIPLIER,
  CONTENT_MULTIPLIER,
  HAPPY_MULTIPLIER,
  SAD_MULTIPLIER,
} from "../Constants.jsx";
import { Crown } from "lucide-react";
import Score from "./Score.jsx";
import {
  useUpdateUserField,
  getUserField,
  useSubmitToLeaderboard,
  useSetLevelData,
} from "../utils/firebase/Firestore.jsx";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Results({
  happy,
  content,
  sad,
  angry,
  isResultOpen,
  score,
  onClose,
  meatSliderValue,
  berriesSliderValue,
  levelTurnKey,
  externalLevelData,
}) {
  const navigate = useNavigate();
  const happyTotal = happy * HAPPY_MULTIPLIER;
  const contentTotal = content * CONTENT_MULTIPLIER;
  const sadTotal = sad * SAD_MULTIPLIER;
  const angryTotal = angry * ANGRY_MULTIPLIER;
  const victoryPoints = happyTotal + contentTotal + sadTotal + angryTotal;
  const updateUserField = useUpdateUserField();
  const submitToLeaderboard = useSubmitToLeaderboard();
  const setLevelData = useSetLevelData();
  const [level, setLevel] = useState(1);
  const [assignedBy, setAssignedBy] = useState("");
  const [name, setName] = useState("");

  const loadData = async (user) => {
    const level = await getUserField("levelReached", 1, user);
    setLevel(level);
    const assignedBy = await getUserField("assignedBy", "", user);
    setAssignedBy(assignedBy);
    const name = await getUserField("name", "", user);
    setName(name);
  };
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadData(user);
      } else {
        // If user is not authenticated, navigate to login
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async () => {
    const totalScore = score + victoryPoints;
    await updateUserField("victoryPoints", totalScore);
    await updateUserField("levelReached", level + 1);
    await submitToLeaderboard(assignedBy, name, totalScore);
    await setLevelData(levelTurnKey, {
      ...externalLevelData,
      completed: true,
      victoryPoints,
      happy,
      content,
      sad,
      angry,
    });
    if (meatSliderValue !== null && meatSliderValue !== undefined) {
      localStorage.setItem("meatSliderValue", meatSliderValue);
      localStorage.setItem("berriesSliderValue", berriesSliderValue);
    }

    navigate("/");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-stone-800 shadow-lg transform ${
        isResultOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-100 ease-in-out z-10`}
    >
      <Score
        score={score}
        add={victoryPoints}
        className={`mt-5 w-fit ml-auto mr-4`}
      />
      <div className="px-12 py-6 overflow-y-auto h-full">
        <div className="flex justify-between mb-5 items-center">
          <p className="font-semibold text-white text-2xl">Results</p>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full font-medium px-4 py-2 text-sm text-stone-300 bg-stone-600"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Happy */}
          <div className="w-full flex flex-col items-center bg-green-400/5 rounded-lg px-4 py-6 border-2 border-green-400/10">
            <p className="text-green-200 text-xl font-medium">
              Happy Villagers
            </p>
            <div className="flex space-x-3 text-xl mt-2">
              <span className="font-semibold italic text-green-200">
                {happy}
              </span>
              <span className="text-stone-200">×</span>
              <span className="font-light text-green-200">
                {HAPPY_MULTIPLIER}
              </span>
              <span className="text-stone-200">=</span>
              <span className="font-semibold text-green-200 underline">
                {happyTotal}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="w-full flex flex-col items-center bg-yellow-400/5 rounded-lg px-4 py-6 border-2 border-yellow-400/10">
            <p className="text-yellow-200 text-xl font-medium">
              Content Villagers
            </p>
            <div className="flex space-x-3 text-xl mt-2">
              <span className="font-semibold italic text-yellow-200">
                {content}
              </span>
              <span className="text-stone-200">×</span>
              <span className="font-light text-yellow-200">
                {CONTENT_MULTIPLIER}
              </span>
              <span className="text-stone-200">=</span>
              <span className="font-semibold text-yellow-200 underline">
                {contentTotal}
              </span>
            </div>
          </div>

          {/* Sad */}
          <div className="w-full flex flex-col items-center bg-blue-400/5 rounded-lg px-4 py-6 border-2 border-blue-400/10">
            <p className="text-blue-200 text-xl font-medium">Sad Villagers</p>
            <div className="flex space-x-3 text-xl mt-2">
              <span className="font-semibold italic text-blue-200">{sad}</span>
              <span className="text-stone-200">×</span>
              <span className="font-light text-blue-200">{SAD_MULTIPLIER}</span>
              <span className="text-stone-200">=</span>
              <span className="font-semibold text-blue-200 underline">
                {sadTotal}
              </span>
            </div>
          </div>

          {/* Angry */}
          <div className="w-full flex flex-col items-center bg-red-400/5 rounded-lg px-4 py-6 border-2 border-red-400/10">
            <p className="text-red-200 text-xl font-medium">Angry Villagers</p>
            <div className="flex space-x-3 text-xl mt-2">
              <span className="font-semibold italic text-red-200">{angry}</span>
              <span className="text-stone-200">×</span>
              <span className="font-light text-red-200">
                {ANGRY_MULTIPLIER}
              </span>
              <span className="text-stone-200">=</span>
              <span className="font-semibold text-red-200 underline">
                {angryTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Victory Points */}
        <div className="flex flex-col items-center justify-center mt-5">
          <p className="font-semibold w-full text-stone-300 text-xl flex items-center justify-center py-2 bg-stone-50/5 self-start px-4 rounded-lg border border-stone-50/15">
            <Crown className={`size-6 mr-2`} />
            Victory Points: {victoryPoints}
          </p>
          <button
            onClick={handleSubmit}
            className="mt-4 cursor-pointer px-6 hover:px-8 py-2 text-xl font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
          >
            Next Turn
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
