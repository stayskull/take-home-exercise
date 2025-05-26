"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import ChatInterface from "../../../../../../components/ChatInterface";
import { fetchPersonaById } from "../../../../../../lib/api";

export default function ChatPage({ params }) {
  const resolvedParams = use(params);
  const { companyId, personaId } = resolvedParams;
  const router = useRouter();
  const [personaName, setPersonaName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPersonaName = async () => {
      setError(null);
      try {
        const data = await fetchPersonaById(personaId);
        if (!data) {
          setError("Persona not found.");
          setLoading(false);
          return;
        }
        setPersonaName(data.name);
      } catch (err) {
        setError(err.message);
        console.error("Failed to load persona for chat:", err);
      } finally {
        setLoading(false);
      }
    };

    if (personaId) {
      loadPersonaName();
    }
  }, [personaId]);

  if (loading)
    return (
      <div className="text-center text-2xl mt-12 text-gray-600">
        Loading chat...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-2xl mt-12 text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link
        href={`/companies/${companyId}`}
        className="text-blue-600 hover:underline mb-6 inline-block font-semibold text-lg"
      >
        &larr; Back to Personas
      </Link>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        Chat with {personaName}
      </h1>
      <ChatInterface personaId={personaId} personaName={personaName} />
    </div>
  );
}
