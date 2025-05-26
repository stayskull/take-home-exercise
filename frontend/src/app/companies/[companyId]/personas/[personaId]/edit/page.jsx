"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import PersonaForm from "../../../../../../components/PersonaForm";
import { fetchPersonaById, updatePersona } from "../../../../../../lib/api";

export default function EditPersonaPage({ params }) {
  const resolvedParams = use(params);
  const { companyId, personaId } = resolvedParams;
  const router = useRouter();
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPersona = async () => {
      setError(null);
      try {
        const data = await fetchPersonaById(personaId);
        setPersona(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to load persona for edit:", err);
      } finally {
        setLoading(false);
      }
    };

    if (personaId) {
      loadPersona();
    }
  }, [personaId]);

  const handleUpdatePersona = async (personaData) => {
    try {
      await updatePersona(personaId, personaData);
      router.push(`/companies/${companyId}`);
    } catch (err) {
      console.error("Error updating persona:", err);
      alert("Failed to update persona: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Loading persona for edit...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-2xl mt-12 text-red-600">
        Error: {error}
      </div>
    );
  if (!persona)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Persona not found.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href={`/companies/${companyId}`}
        className="text-blue-600 hover:underline mb-6 inline-block font-semibold text-lg"
      >
        &larr; Back to Personas
      </Link>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        Edit Persona
      </h1>
      <PersonaForm
        companyId={companyId}
        persona={persona}
        onSubmit={handleUpdatePersona}
        onCancel={() => router.push(`/companies/${companyId}`)}
      />
    </div>
  );
}
