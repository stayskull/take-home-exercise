import React, { useState, useEffect } from "react";

const CompanyForm = ({ company = null, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("Small");
  const [llm, setLlm] = useState("ChatGPT");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name || "");
      setIndustry(company.industry || "");
      setSize(company.size || "Small");
      setLlm(company.llm || "ChatGPT");
      setLlmApiKey(company.llm_api_key || "");
      setTags(company.tags || "");
    } else {
      setName("");
      setIndustry("");
      setSize("Small");
      setLlm("ChatGPT");
      setLlmApiKey("");
      setTags("");
    }
  }, [company]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      industry,
      size,
      llm,
      llm_api_key: llmApiKey,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {company ? "Edit Company" : "Create New Company"}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Company Name:
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

      <div className="mb-4">
        <label
          htmlFor="industry"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Industry:
        </label>
        <input
          type="text"
          id="industry"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="size"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Size:
        </label>
        <select
          id="size"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          required
        >
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="llm"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          LLM:
        </label>
        <select
          id="llm"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={llm}
          onChange={(e) => setLlm(e.target.value)}
          required
        >
          <option value="ChatGPT">ChatGPT</option>
          <option value="Groq">Groq</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="llmApiKey"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          LLM API Key:
        </label>
        <input
          type="text"
          id="llmApiKey"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={llmApiKey}
          onChange={(e) => setLlmApiKey(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="tags"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Tags (comma-separated):
        </label>
        <input
          type="text"
          id="tags"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
        >
          {company ? "Update Company" : "Add Company"}
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

export default CompanyForm;
