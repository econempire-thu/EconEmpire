import React from "react";

const greetings = [
  "Welcome back, Mayor! {village} awaits your leadership.",
  "A new day dawns in {village}. What will you accomplish today?",
  "Your people look to you, Mayor. Guide {village} to greatness!",
  "The foundations of {village} are strong. What will you do next?",
  "Your village thrives under your rule. Keep {village} prosperous!",
  "Progress is within reach. Lead {village} forward!",
  "Challenges lie ahead, but with your wisdom, {village} shall flourish.",
  "Every decision shapes the future of {village}. Choose wisely!",
  "The villagers are eager for your next move. {village} awaits!",
  "Your leadership steers {village} towards a bright future.",
  "A great leader makes a great village. {village} is in your hands.",
  "Under your guidance, {village} will reach new heights!",
  "Your choices define {village}. Lead with vision and courage!",
  "The path to greatness begins now. {village} is ready!",
  "Your village, your rules. Shape {village} as you see fit!",
];

const rand = Math.floor(Math.random() * greetings.length);

const getRandomGreeting = () => {
  const greetingPre = greetings[rand].split("{village}")[0];
  const greetingPost = greetings[rand].split("{village}")[1];
  return { greetingPre, greetingPost };
};

const VillageGreeting = ({ villageName }) => {
  return (
    <p className="ml-3 mt-1 md:text-lg lg:text-2xl text-white text-center">
      {getRandomGreeting().greetingPre}
      <span
        className={`text-white font-telma-medium md:text-lg lg:text-2xl underline`}
      >
        {villageName}
      </span>
      {getRandomGreeting().greetingPost}
    </p>
  );
};

export default VillageGreeting;
