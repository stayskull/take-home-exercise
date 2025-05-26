import React, { useState, useEffect } from "react";

const emotionOptions = ["None", "Low", "Moderate", "High", "Very High"];
const genderOptions = ["Male", "Female", "Non-binary", "Other"];

const PersonaForm = ({ companyId, persona = null, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState(20);
  const [gender, setGender] = useState("Male");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interests, setInterests] = useState("");
  const [challenges, setChallenges] = useState("");
  const [baseEmotionJoy, setBaseEmotionJoy] = useState("None");
  const [baseEmotionTrust, setBaseEmotionTrust] = useState("None");
  const [baseEmotionFear, setBaseEmotionFear] = useState("None");
  const [baseEmotionSurprise, setBaseEmotionSurprise] = useState("None");
  const [baseEmotionSadness, setBaseEmotionSadness] = useState("None");
  const [baseEmotionDisgust, setBaseEmotionDisgust] = useState("None");
  const [baseEmotionAnger, setBaseEmotionAnger] = useState("None");
  const [baseEmotionAnticipation, setBaseEmotionAnticipation] =
    useState("None");

  useEffect(() => {
    if (persona) {
      setName(persona.name || "");
      setAge(persona.age || 20);
      setGender(persona.gender || "Male");
      setLocation(persona.location || "");
      setJobTitle(persona.job_title || "");
      setInterests(persona.interests || "");
      setChallenges(persona.challenges || "");
      setBaseEmotionJoy(persona.base_emotion_joy || "None");
      setBaseEmotionTrust(persona.base_emotion_trust || "None");
      setBaseEmotionFear(persona.base_emotion_fear || "None");
      setBaseEmotionSurprise(persona.base_emotion_surprise || "None");
      setBaseEmotionSadness(persona.base_emotion_sadness || "None");
      setBaseEmotionDisgust(persona.base_emotion_disgust || "None");
      setBaseEmotionAnger(persona.base_emotion_anger || "None");
      setBaseEmotionAnticipation(persona.base_emotion_anticipation || "None");
    } else {
      setName("");
      setAge(20);
      setGender("Male");
      setLocation("");
      setJobTitle("");
      setInterests("");
      setChallenges("");
      setBaseEmotionJoy("None");
      setBaseEmotionTrust("None");
      setBaseEmotionFear("None");
      setBaseEmotionSurprise("None");
      setBaseEmotionSadness("None");
      setBaseEmotionDisgust("None");
      setBaseEmotionAnger("None");
      setBaseEmotionAnticipation("None");
    }
  }, [persona]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      company_id: parseInt(companyId, 10), // Ensure company_id is an integer
      name,
      age: parseInt(age, 10),
      gender,
      location,
      job_title: jobTitle,
      interests,
      challenges,
      base_emotion_joy: baseEmotionJoy,
      base_emotion_trust: baseEmotionTrust,
      base_emotion_fear: baseEmotionFear,
      base_emotion_surprise: baseEmotionSurprise,
      base_emotion_sadness: baseEmotionSadness,
      base_emotion_disgust: baseEmotionDisgust,
      base_emotion_anger: baseEmotionAnger,
      base_emotion_anticipation: baseEmotionAnticipation,
    });
  };

  const emotionSetters = {
    setBaseEmotionJoy,
    setBaseEmotionTrust,
    setBaseEmotionFear,
    setBaseEmotionSurprise,
    setBaseEmotionSadness,
    setBaseEmotionDisgust,
    setBaseEmotionAnger,
    setBaseEmotionAnticipation,
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
    >
      <h2 className="col-span-full text-3xl font-bold mb-4 text-gray-800">
        {persona ? "Edit Persona" : "Create New Persona"}
      </h2>

      <div className="mb-2">
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Name:
        </label>
        <input
          type="text"
          id="name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="age"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Age:
        </label>
        <input
          type="number"
          id="age"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value, 10))}
          min="0"
          required
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="gender"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Gender:
        </label>
        <select
          id="gender"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          {genderOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label
          htmlFor="location"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Location:
        </label>
        <input
          type="text"
          id="location"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="jobTitle"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Job Title:
        </label>
        <input
          type="text"
          id="jobTitle"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="interests"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Interests:
        </label>
        <input
          type="text"
          id="interests"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label
          htmlFor="challenges"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Challenges:
        </label>
        <input
          type="text"
          id="challenges"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
        />
      </div>

      <h3 className="col-span-full text-xl font-semibold mt-4 mb-2 text-gray-800">
        Base Emotions:
      </h3>
      {Object.entries({
        joy: baseEmotionJoy,
        trust: baseEmotionTrust,
        fear: baseEmotionFear,
        surprise: baseEmotionSurprise,
        sadness: baseEmotionSadness,
        disgust: baseEmotionDisgust,
        anger: baseEmotionAnger,
        anticipation: baseEmotionAnticipation,
      }).map(([emotion, value]) => {
        const setterName = `setBaseEmotion${
          emotion.charAt(0).toUpperCase() + emotion.slice(1)
        }`;
        const setter = emotionSetters[setterName];
        return (
          <div className="mb-2" key={emotion}>
            <label
              htmlFor={`baseEmotion${emotion}`}
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
            </label>
            <select
              id={`baseEmotion${emotion}`}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => setter(e.target.value)}
              required
            >
              {emotionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <div className="col-span-full flex items-center justify-between mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
        >
          {persona ? "Update Persona" : "Add Persona"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PersonaForm;
