"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchCompanyById,
  fetchPersonasByCompanyId,
  deletePersona,
} from "../../../lib/api";

export default function CompanyPersonasPage({ params }) {
  const resolvedParams = use(params);
  const { companyId } = resolvedParams;
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const companyData = await fetchCompanyById(companyId);
      if (!companyData) {
        setError("Company not found.");
        setLoading(false);
        return;
      }
      setCompany(companyData);
      const personasData = await fetchPersonasByCompanyId(companyId);
      setPersonas(personasData);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load company or personas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const handleDeletePersona = async (personaId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this persona? This action cannot be undone."
      )
    ) {
      try {
        await deletePersona(personaId);
        await loadData(); // Reload personas
      } catch (err) {
        setError(err.message);
        alert(`Deletion failed: ${err.message}`);
      }
    }
  };

  if (loading)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Loading company and personas...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-2xl mt-12 text-red-600">
        Error: {error}
      </div>
    );
  if (!company)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Company not found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link
        href="/companies"
        className="text-blue-600 hover:underline mb-6 inline-block font-semibold text-lg"
      >
        &larr; Back to Companies
      </Link>
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Personas for {company.name}
      </h1>

      <div className="flex justify-end mb-8">
        <Link
          href={`/companies/${companyId}/personas/new`}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
        >
          Add New Persona
        </Link>
      </div>

      {personas.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">
          No personas found for this company. Add one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="bg-white rounded-xl shadow-lg p-7 border border-gray-200 flex flex-col justify-between transform hover:scale-105 transition duration-200 ease-in-out"
            >
              <div>
                <h3 className="text-3xl font-semibold text-purple-800 mb-3">
                  {persona.name}
                </h3>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Job:</span> {persona.job_title}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Gender:</span> {persona.gender}
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-medium">Location:</span>{" "}
                  {persona.location}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link
                  href={`/companies/${companyId}/personas/${persona.id}/chat`}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  New Chat
                </Link>
                <Link
                  href={`/companies/${companyId}/personas/${persona.id}/conversations`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  View Conversations
                </Link>
                <Link
                  href={`/companies/${companyId}/personas/${persona.id}/edit`}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeletePersona(persona.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm shadow-md transition duration-200 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
