"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchPersonaById, fetchConversationsByPersona } from "@/lib/api";
import ChatInterface from "@/components/ChatInterface";

export default function ConversationsPage({ params }) {
  const resolvedParams = use(params);
  const { companyId, personaId } = resolvedParams;
  const [personaName, setPersonaName] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState(null); // This is the key state

  useEffect(() => {
    const loadConversationsPlus = async () => {
      if (!personaId) return;
      setLoadingConversations(true);
      try {
        const nameData = await fetchPersonaById(personaId);
        if (nameData) {
          setPersonaName(nameData.name);
        }
        const data = await fetchConversationsByPersona(personaId);
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    if (personaId) {
      loadConversationsPlus();
    }
  }, [personaId]);

  const handleSelectConversation = (convId) => {
    // Renamed param to convId for clarity
    setSelectedConversationId(convId); // Updates the state
  };

  return (
    <div className="container mx-auto p-8">
      <Link
        href={`/companies/${companyId}`}
        className="text-blue-600 hover:underline mb-6 inline-block font-semibold text-lg"
      >
        &larr; Back to Personas
      </Link>
      <h1 className="text-3xl font-bold mb-6">Conversations with {personaName}</h1>
      <p className="text-lg text-gray-700 mb-6">
        You are currently interacting with Persona ID: {personaName} (from
        Company ID: {companyId})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar for conversations list */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Conversations</h2>
          <button
            onClick={() => handleSelectConversation(null)} // Set selected ID to null for new convo
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg mb-4"
          >
            Start New Conversation
          </button>
          {loadingConversations ? (
            <p className="text-gray-500">Loading past conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500">
              No past conversations found for this persona.
            </p>
          ) : (
            <ul>
              {conversations.map((conv) => (
                <li key={conv.id} className="mb-2">
                  <button
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-lg border
                                                    ${
                                                      selectedConversationId ===
                                                      conv.id
                                                        ? "bg-blue-100 border-blue-500"
                                                        : "bg-white border-gray-300 hover:bg-gray-100"
                                                    }
                                                    transition duration-150 ease-in-out`}
                  >
                    <p className="font-semibold">
                      {conv.name || `Conversation ${conv.id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last updated:{" "}
                      {new Date(conv.changed_date).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      State: {conv.conversation_state}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          <ChatInterface
            personaId={personaId}
            personaName={personaName}
            initialConversationId={selectedConversationId} // Pass the selected ID as prop
          />
        </div>
      </div>
    </div>
  );
}
