import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase.config.js";
import useAuth from "../../hooks/useAuth.jsx";
import { useEffect, useState } from "react";

export const fetchAndCacheUserData = async (db, user) => {
  if (!user) return;

  const userDocRef = doc(db, "users", user.uid);

  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      localStorage.setItem("userData", JSON.stringify(userData));
    }
    return onSnapshot(
      userDocRef,
      { includeMetadataChanges: true },
      (docSnap) => {
        if (docSnap.exists()) {
          const updatedUserData = docSnap.data();
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
          console.log("User data updated from Firestore.");
        }
      },
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

export const getUserField = async (field, defaultValue, user) => {
  if (!user) return defaultValue;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists()
      ? (userDoc.data()[field] ?? defaultValue)
      : defaultValue;
  } catch (error) {
    console.error(`Error fetching ${field}:`, error);
    return defaultValue;
  }
};

export const fetchPasswordByEmail = async (emailToFind) => {
  try {
    // 1) Build a query: Users where email == emailToFind
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", emailToFind));

    // 2) Execute the query
    const querySnapshot = await getDocs(q);

    // 3) If no matching document, return null
    if (querySnapshot.empty) {
      return null;
    }

    // 4) Otherwise, grab the first match (should be unique)
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();

    // 5) Return the password field (or null if it’s missing)
    return data.password || null;
  } catch (err) {
    console.error("Error fetching password by email:", err);
    return null;
  }
};

export const getLevelData = async (levelId, user) => {
  try {
    const levelDocRef = doc(
      db,
      "users",
      user.uid,
      "Levels",
      levelId.toString(),
    );
    const levelDoc = await getDoc(levelDocRef);
    return levelDoc.exists() ? levelDoc.data() : null;
  } catch (error) {
    console.error(`Error fetching Level ${levelId} data:`, error);
    return null;
  }
};

export const getLevelField = async (field, levelId, defaultValue, user) => {
  try {
    const levelDocRef = doc(
      db,
      "users",
      user.uid,
      "Levels",
      levelId.toString(),
    );
    const levelDoc = await getDoc(levelDocRef);
    return levelDoc.exists()
      ? (levelDoc.data()[field] ?? defaultValue)
      : defaultValue;
  } catch (error) {
    console.error(`Error fetching level ${levelId} field ${field}:`, error);
    return defaultValue;
  }
};

export const getVillageAssigned = async (user) => {
  if (!user) return false;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    return userDoc.exists() ? userDoc.data().villageAssigned || false : false;
  } catch (error) {
    console.error("Error fetching villageAssigned:", error);
    return false;
  }
};

export const getMaxLevelAllowed = async (user) => {
  if (!user) return 1;

  try {
    // Fetch the current user's document to get the assignedBy field
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist");
      return 1;
    }

    const assignedByUid = userDoc.data().assignedBy; // Get the assignedBy field

    if (!assignedByUid) {
      console.error("AssignedBy field is missing");
      return 1;
    }

    // Fetch the document of the user who assigned the current user
    const assignedByDocRef = doc(db, "users", assignedByUid);
    const assignedByDoc = await getDoc(assignedByDocRef);

    if (assignedByDoc.exists()) {
      // Return the maxLevelAllowed field from the assigned user's document
      return assignedByDoc.data().maxLevelAllowed || 1;
    } else {
      console.error("AssignedBy user document does not exist");
      return 1;
    }
  } catch (error) {
    console.error("Error fetching maxLevelAllowed:", error);
    return 1;
  }
};

export const getRegionName = async (user) => {
  if (!user) return "Region Name not found";

  try {
    // Fetch the current user's document to get the regionId field
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document does not exist");
      return "Region Name not found";
    }

    const regionId = userDoc.data().regionId; // Get the regionId field

    if (!regionId) {
      console.error("regionId field is missing");
      return "Region Name not found";
    }

    // Fetch the document of the user who assigned the current user
    const regionIdDocRef = doc(db, "regions", regionId);
    const regionIdDoc = await getDoc(regionIdDocRef);

    if (regionIdDoc.exists()) {
      // Return the region name field from the assigned user's document
      return regionIdDoc.data().name || "Region Name not found";
    } else {
      console.error("RegionID user document does not exist");
      return "Region Name not found";
    }
  } catch (error) {
    console.error("Error fetching region name:", error);
    return "Region Name not found";
  }
};

export const useUpdateUserField = () => {
  const { user } = useAuth();

  return async (field, value) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { [field]: value }, { merge: true });
      console.log("Field updated successfully");
    } catch (error) {
      console.error("Error updating user field:", error);
    }
  };
};

export const useSubmitToLeaderboard = () => {
  const { user } = useAuth();

  return async (teacherUid, name, score) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "leaderboards", teacherUid, "users", user.uid), {
        name,
        score,
      });
      console.log("Score submitted successfully!");
    } catch (error) {
      console.error("Error submitting score: ", error);
    }
  };
};

export const useTradeValues = (partnerVillageId, levelId) => {
  const [tradeValues, setTradeValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerVillageId || !levelId) return;

    const docRef = doc(
      db,
      "users",
      partnerVillageId,
      "Levels",
      String(levelId),
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setTradeValues(docSnap.data());
          setLoading(false);
        } else {
          setTradeValues(null);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error listening to trade values:", error);
        setLoading(false);
      },
    );

    // Cleanup the listener when component unmounts or dependencies change
    return () => unsubscribe();
  }, [db, partnerVillageId, levelId]);

  return { tradeValues, loading };
};

export const useSetTradeValueLvl1 = () => {
  const { user } = useAuth();

  return async (
    levelId,
    meatTradeValue,
    berriesTradeValue,
    meatProductionValue,
    berriesProductionValue,
  ) => {
    if (!user) return false;
    try {
      await setDoc(doc(db, "users", user.uid, "Levels", String(levelId)), {
        MeatTradeValue: meatTradeValue,
        BerriesTradeValue: berriesTradeValue,
        MeatProductionValue: meatProductionValue,
        BerriesProductionValue: berriesProductionValue,
      });
      return true;
    } catch (error) {
      console.error("Error submitting trade: ", error);
      return false;
    }
  };
};

export const useSetLevelData = () => {
  const { user } = useAuth();
  return async (levelId, levelData) => {
    if (!user) return false;
    try {
      await setDoc(
        doc(db, "users", user.uid, "Levels", String(levelId)),
        levelData,
        { merge: true },
      );
      return true;
    } catch (error) {
      console.error("Error submitting trade: ", error);
      return false;
    }
  };
};

export const useSetWaitingList = () => {
  const { user } = useAuth();

  return async () => {
    if (!user) return false;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { isWaiting: true },
        { merge: true },
      );
      return true;
    } catch (error) {
      console.error("Error adding to waiting list: ", error);
      return false;
    }
  };
};

export const clearWaitingStatus = async (userId) => {
  if (!userId) return false;
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        isWaiting: false,
      },
      { merge: true },
    );
    return true;
  } catch (error) {
    console.error("Error clearing waiting status: ", error);
    return false;
  }
};

export const useEndTradingPhaseLvl2 = () => {
  const { user } = useAuth();
  return async (levelId, tradeCompleted) => {
    if (!user) return false;
    try {
      await setDoc(
        doc(db, "users", user.uid, "Levels", String(levelId)),
        {
          tradeCompleted,
        },
        { merge: true },
      );
      return true;
    } catch (error) {
      console.error("Error submitting trade: ", error);
      return false;
    }
  };
};

export const useSetTradeValueLvl2 = () => {
  const { user } = useAuth();

  return async (levelId, meat, berries, rice, beer, salt, gold) => {
    if (!user) return false;
    try {
      await setDoc(doc(db, "users", user.uid, "Levels", String(levelId)), {
        meat,
        berries,
        rice,
        beer,
        salt,
        gold,
      });
      return true;
    } catch (error) {
      console.error("Error submitting trade: ", error);
      return false;
    }
  };
};

export const fetchLeaderboard = async (teacherUid, user) => {
  if (!user) return [];
  try {
    const q = query(
      collection(db, "leaderboards", teacherUid, "users"),
      orderBy("score", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching leaderboard: ", error);
  }
};

export const fetchPartnerId = async (partnerVillageLetter, regionId) => {
  if (!partnerVillageLetter || !regionId) return null;
  try {
    const regionDocRef = doc(db, "regions", regionId);
    const regionDoc = await getDoc(regionDocRef);
    if (regionDoc.exists()) {
      return regionDoc.data()["villages"][
        partnerVillageLetter.toLowerCase()
      ][0]["id"];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching partner id:", error);
  }
};

export const fetchPartnerVillageName = async (partnerId) => {
  if (!partnerId) return null;
  try {
    const userDocRef = doc(db, "users", partnerId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().villageName || "Unknown village";
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching partner id:", error);
  }
};
