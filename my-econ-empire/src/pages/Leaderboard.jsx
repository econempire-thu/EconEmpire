import React, { useEffect, useState } from "react";
import NavBar from "../components/Navbar.jsx";
import bg from "../assets/backgrounds/start_card_bg_green_upscaled.jpg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchLeaderboard,
  getUserField,
} from "../utils/firebase/Firestore.jsx";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const getLeaderboardData = async (user) => {
    const assignedBy = await getUserField("assignedBy", "", user);
    const leaderboard = await fetchLeaderboard(assignedBy, user);
    setLeaderboard(leaderboard);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getLeaderboardData(user);
        setCurrentUserId(user.uid);
      } else {
        // If user is not authenticated, navigate to login
        navigate("/log-in");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const columns = [
    {
      name: "Rank",
      selector: (row, index) => index + 1,
      width: "100px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
    },
    {
      name: "Score",
      selector: (row) => row.score,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => row.id === currentUserId,
      style: {
        backgroundColor: "#222", // Green background for current user
        color: "white",
        fontWeight: "bold",
      },
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "16px", // Bigger font for table headers
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        fontSize: "14px", // Bigger font for table cells
      },
    },
    rows: {
      style: {
        fontSize: "14px", // Bigger font for entire row
        minHeight: "50px", // Adjust row height
      },
    },
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none font-default`}
    >
      <NavBar currentPage={"Leaderboard"} />
      <div className={`pt-20 relative h-screen`}>
        <img
          src={bg}
          className="absolute inset-0 object-cover bg-center w-full h-full"
          alt="background"
        />
        {/* Foreground Black Overlay */}
        <div className="absolute inset-0 bg-black/85" />

        <div className="relative flex flex-col px-10 h-full py-10 items-center z-10">
          <h1 className="text-white text-4xl font-bold mb-10">Leaderboard</h1>

          <div className="w-full max-w-2xl h-full overflow-y-auto">
            <DataTable
              columns={columns}
              data={leaderboard}
              fixedHeader={true}
              conditionalRowStyles={conditionalRowStyles}
              fixedHeaderScrollHeight="700px"
              customStyles={customStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
