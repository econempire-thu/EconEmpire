import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase.config.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import SystemButton from "../components/SystemButton.jsx";
import AlertPopup from "../components/AlertPopup.jsx";

function TeacherCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setAlertMessage("Please enter a teacher code");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    try {
      // Query Firestore for the teacher code
      const codesRef = collection(db, "teacherCodes");
      const q = query(
        codesRef,
        where("code", "==", code.trim()),
        where("active", "==", true),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setAlertMessage("Invalid or expired teacher code");
        setShowAlert(true);
        setLoading(false);
        return;
      }

      // Get the document with the teacher code information
      const teacherCodeDoc = querySnapshot.docs[0];
      const teacherCodeData = teacherCodeDoc.data();

      // Store the code and teacher ID in session storage
      sessionStorage.setItem("validTeacherCode", code.trim());

      // Store the teacher ID if it exists in the document
      if (teacherCodeData.teacherId) {
        sessionStorage.setItem("teacherId", teacherCodeData.teacherId);
      }

      // Navigate to login page
      navigate("/log-in");
    } catch (error) {
      console.error("Error verifying teacher code:", error);
      setAlertMessage("An error occurred. Please try again.");
      setShowAlert(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden items-center justify-center bg-stone-950 select-none px-5 font-default">
      <h1 className="font-telma-medium text-5xl text-stone-50">Econ Empire</h1>

      {showAlert && (
        <AlertPopup
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="mt-10 p-6 bg-stone-900 w-full max-w-lg rounded-xl">
        <h2 className="text-stone-300 text-xl mb-4 text-center">
          Enter Teacher Code
        </h2>

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="mb-6 bg-stone-800 rounded-lg px-3 py-2">
            <label
              htmlFor="code"
              className="block text-sm md:text-base text-stone-300"
            >
              Teacher Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full md:text-lg lg:text-xl text-stone-300 focus:outline-none"
              placeholder="Enter code provided by your teacher"
            />
          </div>

          <div className="flex justify-between w-full">
            <SystemButton
              onClick={() => navigate("/")}
              type="button"
              label="Back"
            />
            <SystemButton
              type="submit"
              disabled={loading}
              label={loading ? "Verifying..." : "Continue"}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherCode;
