import { useNavigate, useSearchParams } from "react-router-dom";
import Score from "../components/Score.jsx";
import React, { useEffect, useState } from "react";
import Level1Turn1 from "../components/levels/1/Level1Turn1.jsx";
import { BookOpenText, Info, Menu, X } from "lucide-react";
import { getUserField } from "../utils/firebase/Firestore.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../components/Loading.jsx";
import Level1Turn6 from "../components/levels/1/Level1Turn6.jsx";
import Level2Turn1 from "../components/levels/2/Level2Turn1.jsx";
import Trader from "../assets/icons/trader.png";
import Villager from "../assets/icons/villager.png";
import Timber from "../components/Timber.jsx";
import Coin from "../components/Coins.jsx";
import Level2Turn6 from "../components/levels/2/Level2Turn6.jsx";
import ScoringModal from "../components/ScoringModal.jsx";
import Meat from "../components/Meat.jsx";
import Berries from "../components/Berries.jsx";
import Rice from "../components/Rice.jsx";
import Beer from "../components/Beer.jsx";
import Salt from "../components/Salt.jsx";

function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level");
  const turn = searchParams.get("turn");
  const [score, setScore] = useState(0);
  const [timber, setTimber] = useState(0);
  const [coins, setCoins] = useState(0);
  const [meat, setMeat] = useState(0);
  const [berries, setBerries] = useState(0);
  const [rice, setRice] = useState(0);
  const [beer, setBeer] = useState(0);
  const [salt, setSalt] = useState(0);
  const [DBLevel, setDBLevel] = useState(1);
  const [DBTurn, setDBTurn] = useState(1);
  const [loading, setLoading] = useState(true);
  const [villageLetter, setVillageLetter] = useState("A");
  const [regionId, setRegionId] = useState("");
  const [localUser, setLocalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = async (user) => {
    setLoading(true); // Set loading to true when fetching data
    const vp = await getUserField("victoryPoints", 0, user);
    setScore(vp);
    const coinsDB = await getUserField("gold", 0, user);
    setCoins(coinsDB);
    const timberDB = await getUserField("timber", 0, user);
    setTimber(timberDB);
    const villageLetter = await getUserField("villageLetter", "A", user);
    setVillageLetter(villageLetter);
    const regionId = await getUserField("regionId", "", user);
    setRegionId(regionId);
    const level = await getUserField("levelReached", 1, user);
    setDBLevel(Math.floor((level - 1) / 10) + 1);
    setDBTurn(((level - 1) % 10) + 1);
    setLoading(false); // Set loading to false after data is fetched
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLocalUser(user);
        loadData(user);
      } else {
        // If user is not authenticated, navigate to login
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const validateLevelAndTurn = () => {
    if (parseInt(level) !== DBLevel || parseInt(turn) !== DBTurn) {
      navigate("/");
    } else {
      const tipInfo = tipsMapping[levelTurnKey];
      setTipOpen(tipInfo ? tipInfo.openByDefault : false);
    }
  };

  useEffect(() => {
    if (DBLevel > 1 || DBTurn > 1) {
      validateLevelAndTurn();
    }
  }, [DBLevel, DBTurn, level, turn]);

  const [resultsOpen, setResultsOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipTitle, setTipTitle] = useState("");
  const [tipDescription, setTipDescription] = useState("");

  const levelAndTurnComponents = {
    1: Level1Turn1,
    2: Level1Turn1,
    3: Level1Turn1,
    4: Level1Turn1,
    5: Level1Turn1,
    6: Level1Turn6,
    7: Level1Turn6,
    8: Level1Turn6,
    9: Level1Turn6,
    10: Level1Turn6,
    11: Level2Turn1,
    12: Level2Turn1,
    13: Level2Turn1,
    14: Level2Turn1,
    15: Level2Turn1,
    16: Level2Turn6,
    17: Level2Turn6,
    18: Level2Turn6,
    19: Level2Turn6,
    20: Level2Turn6,
  };

  const tips = {
    TipL1T1to5: {
      title: "Level 1: The Dawn of Prosperity",
      description:
        "Your journey begins in a small but promising settlement. To thrive, you must produce two essential resources: Meat & Berries. Each has its own production function, meaning efficiency depends on how you allocate your resources. Will you focus on gathering berries, hunting for meat, or finding the perfect balance between both? Experiment with different strategies to maximize your output and build a strong foundation for your growing economy. Think wisely—every choice you make shapes the future of your empire!",
    },
    TipL1T6to10: {
      title: "Level 1: The Age of Trade",
      description:
        "Your settlement has grown, and new opportunities arise! Now, you can trade with a neighboring village, exchanging resources to strengthen your economy.\n\nMeat and berries are valuable not just for survival, but also for strategic trade. You can choose to send what you have in surplus or expect to receive what you lack. The final outcome at the end of the day depends on both your decisions and the actions of the other village.\n\nWill you specialize and rely on trade, or aim for self-sufficiency? Experiment with different trade strategies to optimize your resource balance and maximize your score!",
    },
    TipL2T1to2: {
      title: "Level 2: The Era of Expansion",
      description:
        "A trader has arrived at your settlement, bringing with them valuable new goods: Rice, Beer, Salt, and Coins. With these new resources, your economy is about to take a leap forward! You now have the opportunity to experiment with more diverse trade strategies and diversify your production.\n\nHowever, managing these goods requires careful planning. While Timber and Coins can be stored for later use, all other goods—Berries, Meat, Rice, Beer, and Salt—will waste if not consumed or traded promptly. Will you focus on stockpiling Timber and Coins, or will you trade and consume the perishable goods to avoid waste?\n\nIn addition to resource management, the trader has introduced the concept of buildings and timber production. Use timber to build structures that will support your growing economy. As you expand, you will face new challenges, but with smart planning and resource allocation, your settlement can thrive. Every decision you make now will shape the future of your empire!",
    },
    TipL2T3: {
      title: "Level 2: The Era of Expansion",
      description: "Trade prices changed for Timber, check it out!",
    },
    TipL2T4to5: {
      title: "Level 2: The Era of Expansion",
      description: "Trade prices changed for Rice, check it out!",
    },
    TipL2T6: {
      title: "Level 2: The Era of Expansion",
      description:
        "Your settlement is growing, and it's time to build the foundation for a more efficient economy. New buildings are now available to help you streamline production: construct the Meat Camp to increase meat output, the Berries Hut to improve berry harvesting, and the Timber Lodge to enhance timber collection.\n\nEach structure requires timber to build, so prioritize based on your needs and long-term goals. Investing in the right infrastructure early on will give your settlement the edge it needs to thrive in the challenges ahead. Choose wisely—your empire's future depends on it!\n\nAlso, the Trade prices changed for Timber, check it out!",
    },
    TipL2T7: {
      title: "Level 2: The Era of Expansion",
      description: "Trade prices changed for Timber, check it out!",
    },
    TipL2T8: {
      title: "Level 2: The Era of Expansion",
      description: "Trade prices changed for Salt, check it out!",
    },
    TipL2T9to10: {
      title: "Level 2: The Era of Expansion",
      description: "Trade prices changed for Salt, check it out!",
    },
  };

  const tipsMapping = {
    1: { tipId: "TipL1T1to5", openByDefault: true },
    2: { tipId: "TipL1T1to5", openByDefault: false },
    3: { tipId: "TipL1T1to5", openByDefault: false },
    4: { tipId: "TipL1T1to5", openByDefault: false },
    5: { tipId: "TipL1T1to5", openByDefault: false },
    6: { tipId: "TipL1T6to10", openByDefault: true },
    7: { tipId: "TipL1T6to10", openByDefault: false },
    8: { tipId: "TipL1T6to10", openByDefault: false },
    9: { tipId: "TipL1T6to10", openByDefault: false },
    10: { tipId: "TipL1T6to10", openByDefault: false },
    11: { tipId: "TipL2T1to2", openByDefault: true },
    12: { tipId: "TipL2T1to2", openByDefault: false },
    13: { tipId: "TipL2T3", openByDefault: true },
    14: { tipId: "TipL2T4to5", openByDefault: true },
    15: { tipId: "TipL2T4to5", openByDefault: false },
    16: { tipId: "TipL2T6", openByDefault: true },
    17: { tipId: "TipL2T7", openByDefault: true },
    18: { tipId: "TipL2T8", openByDefault: true },
    19: { tipId: "TipL2T9to10", openByDefault: true },
    20: { tipId: "TipL2T9to10", openByDefault: false },
  };

  const scoringInfo = {
    Lvl1: {
      happy: "Consumes Meat and Berries",
      content: "Consumes 2 of Meat or Berries",
      sad: "Consumes Meat or Berries",
      angry: "No consumption",
    },
    Lvl2: {
      happy: "Content and Beer + Salt + 10 Coins",
      content: "Consumes Berries + Rice or Meat + Rice or Berries + Meat",
      sad: "Consumes 2 of Meat or Berries or Rice",
      angry: "No consumption or only one of Meat or Berries or Rice ",
    },
  };

  const tipIconMapping = {
    1: Villager,
    2: Villager,
    3: Villager,
    4: Villager,
    5: Villager,
    6: Villager,
    7: Villager,
    8: Villager,
    9: Villager,
    10: Villager,
    11: Trader,
    12: Trader,
    13: Trader,
    14: Trader,
    15: Trader,
    16: Trader,
    17: Trader,
    18: Trader,
    19: Trader,
    20: Trader,
  };

  const scoringInfoMapping = {
    1: scoringInfo.Lvl1,
    2: scoringInfo.Lvl1,
    3: scoringInfo.Lvl1,
    4: scoringInfo.Lvl1,
    5: scoringInfo.Lvl1,
    6: scoringInfo.Lvl1,
    7: scoringInfo.Lvl1,
    8: scoringInfo.Lvl1,
    9: scoringInfo.Lvl1,
    10: scoringInfo.Lvl1,
    11: scoringInfo.Lvl2,
    12: scoringInfo.Lvl2,
    13: scoringInfo.Lvl2,
    14: scoringInfo.Lvl2,
    15: scoringInfo.Lvl2,
    16: scoringInfo.Lvl2,
    17: scoringInfo.Lvl2,
    18: scoringInfo.Lvl2,
    19: scoringInfo.Lvl2,
    20: scoringInfo.Lvl2,
  };

  const levelTurnKey = (Number(level) - 1) * 10 + Number(turn);
  const LevelAndTurn = levelAndTurnComponents[levelTurnKey];

  // Set tip title and description dynamically
  useEffect(() => {
    const tipInfo = tipsMapping[levelTurnKey];
    if (tipInfo) {
      setTipTitle(tips[tipInfo.tipId].title);
      setTipDescription(tips[tipInfo.tipId].description);
    } else {
      setTipTitle("");
      setTipDescription("");
    }
  }, [levelTurnKey]);

  if (loading) {
    return <Loading />;
  }

  // If there is no matching component, show an error popup or redirect
  if (!LevelAndTurn) {
    return <Loading />;
  }

  return (
    <div className="relative flex flex-col h-dvh bg-stone-950 select-none font-default">
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-white bg-stone-800 rounded-md"
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Sidebar Panel */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-51 flex bg-black/50"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-64 bg-stone-800 p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white"
              >
                <X className="text-3xl" />
              </button>
            </div>
            {/* Top Bar Info */}
            <div className="mb-6">
              <div>
                <span className="font-semibold text-lg bg-emerald-200 text-emerald-800 px-4 py-1 rounded-full">
                  Level {level}
                </span>
                <span className="font-semibold text-lg bg-emerald-200 text-emerald-800 px-4 py-1 rounded-full ml-2">
                  Turn {turn}
                </span>
              </div>
              <div className="mt-2 flex lg:flex-row flex-col-reverse gap-x-4 gap-y-2">
                {levelTurnKey > 10 && <Salt salt={salt} />}
                {levelTurnKey > 10 && <Beer beer={beer} />}
                {levelTurnKey > 10 && <Rice rice={rice} />}
                {levelTurnKey > 10 && <Timber timber={timber} />}
                {levelTurnKey > 10 && <Berries berries={berries} />}
                {levelTurnKey > 10 && <Meat meat={meat} />}
                {levelTurnKey > 10 && <Coin coin={coins} />}
                <Score score={score} />
              </div>
            </div>
            {/* Bottom Bar Info */}
            <div className="flex flex-col gap-4">
              <div
                className="flex gap-x-2 px-3 py-1.5 text-white cursor-pointer bg-gradient-to-r from-stone-800 to-stone-700 rounded-full"
                onClick={() => {
                  setTipOpen(true);
                  setSidebarOpen(false);
                }}
              >
                <BookOpenText />
                <p>About Level</p>
              </div>
              <div
                className="flex gap-x-2 px-3 py-1.5 text-white cursor-pointer bg-gradient-to-r from-stone-800 to-stone-700 rounded-full"
                onClick={() => {
                  setShowModal(true);
                  setSidebarOpen(false);
                }}
              >
                <Info />
                <p>Scoring Info</p>
              </div>
              <button
                onClick={() => {
                  navigate("/");
                  setSidebarOpen(false);
                }}
                className="w-full px-6 py-2 font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Top Bar */}
      <div className="hidden lg:flex bg-[url(./assets/backgrounds/start_card_bg_green.jpg)] bg-cover h-16 w-full bg-center px-4 py-2 justify-between items-center">
        <div>
          <span className="font-semibold lg:text-xl bg-emerald-200 text-emerald-800 px-4 py-0.75 rounded-full">
            Level {level}
          </span>
          <span className="font-semibold lg:text-xl bg-emerald-200 text-emerald-800 px-4 py-0.75 rounded-full ml-2">
            Turn {turn}
          </span>
        </div>
        <div className="flex gap-x-1">
          {levelTurnKey > 10 && <Salt salt={salt} />}
          {levelTurnKey > 10 && <Beer beer={beer} />}
          {levelTurnKey > 10 && <Rice rice={rice} />}
          {levelTurnKey > 10 && <Timber timber={timber} />}
          {levelTurnKey > 10 && <Berries berries={berries} />}
          {levelTurnKey > 10 && <Meat meat={meat} />}
          {levelTurnKey > 10 && <Coin coin={coins} />}
          <Score score={score} />
        </div>
      </div>

      {/* Scrollable Level Content */}
      <div className="flex-grow overflow-auto">
        <LevelAndTurn
          refreshData={loadData}
          user={localUser}
          score={score}
          onResultsOpen={setResultsOpen}
          villageLetter={villageLetter}
          regionId={regionId}
          levelTurnKey={levelTurnKey}
          timberStored={timber}
          coinsStored={coins}
          setTimber={setTimber}
          setMeat={setMeat}
          setBerries={setBerries}
          setRice={setRice}
          setBeer={setBeer}
          setSalt={setSalt}
        />
      </div>

      {/* Desktop Bottom Bar */}
      <div className="hidden lg:flex bg-stone-900 w-full flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0 px-4 py-2 lg:h-16">
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-x-4 items-center">
          <div
            className="flex gap-x-2 px-3 py-1.5 text-white cursor-pointer bg-gradient-to-r from-stone-800 to-stone-700 rounded-full"
            onClick={() => setTipOpen(true)}
          >
            <BookOpenText />
            <p>About Level</p>
          </div>
          <div
            className="flex gap-x-2 px-3 py-1.5 text-white cursor-pointer bg-gradient-to-r from-stone-800 to-stone-700 rounded-full"
            onClick={() => setShowModal(true)}
          >
            <Info />
            <p>Scoring Info</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer px-6 py-2 font-semibold rounded-full flex items-center transition-all ease-in-out duration-200 bg-stone-300 text-stone-800 hover:bg-stone-200 w-full lg:w-auto"
        >
          Back to Home
        </button>
      </div>

      {/* Tip Modal */}
      {tipOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5">
          <div className="relative bg-[url(./assets/backgrounds/start_card_bg_blue_upscaled.jpg)] bg-center bg-cover rounded-2xl w-full max-w-3xl border border-white/40 h-[80vh]">
            <div className="absolute inset-0 bg-black/85 rounded-2xl"></div>
            <X
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-200 text-3xl cursor-pointer z-20"
              onClick={() => setTipOpen(false)}
            />
            <div className="relative z-10 h-full flex flex-col lg:flex-row items-center p-6 gap-6">
              {/* Image (fixed) */}
              <img
                src={tipIconMapping[levelTurnKey]}
                alt="Tip Icon"
                className="w-24 h-24 lg:w-64 lg:h-64 shrink-0"
              />
              {/* Scrollable Text Content */}
              <div className="flex-1 overflow-y-auto max-h-full text-white pr-2">
                <h3 className="md:text-lg lg:text-xl font-semibold">
                  {tipTitle}
                </h3>
                <p className="text-sm md:text-base lg:text-lg mt-4 text-neutral-300 whitespace-pre-wrap">
                  {tipDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Modal */}
      <ScoringModal
        showModal={showModal}
        setShowModal={setShowModal}
        happyText={scoringInfoMapping[levelTurnKey].happy}
        contentText={scoringInfoMapping[levelTurnKey].content}
        sadText={scoringInfoMapping[levelTurnKey].sad}
        angryText={scoringInfoMapping[levelTurnKey].angry}
      />
    </div>
  );
}

export default Game;
