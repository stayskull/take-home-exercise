"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import PersonaForm from "../../../../../components/PersonaForm";
import { createPersona } from "../../../../../lib/api";

export default function NewPersonaPage({ params }) {
  const resolvedParams = use(params);
  const { companyId } = resolvedParams;
  const router = useRouter();

  const handleCreatePersona = async (personaData) => {
    try {
      await createPersona(personaData);
      router.push(`/companies/${companyId}`);
    } catch (error) {
      console.error("Error creating persona:", error);
      alert("Failed to create persona: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href={`/companies/${companyId}`}
        className="text-blue-600 hover:underline mb-6 inline-block font-semibold text-lg"
      >
        &larr; Back to Personas
      </Link>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
        Add New Persona
      </h1>
      <PersonaForm
        companyId={companyId}
        onSubmit={handleCreatePersona}
        onCancel={() => router.push(`/companies/${companyId}`)}
      />
    </div>
  );
}
