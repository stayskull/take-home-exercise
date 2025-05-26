"use client";

import React, { useState, useRef, useEffect } from "react";
import { chatWithPersona, fetchConversationLogs } from "../lib/api";

const ChatInterface = ({ personaId, personaName, initialConversationId = null }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);

  // State for Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    // Speech Recognition setup
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        console.log("Speech recognition started...");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        console.log("Speech recognition result:", transcript);
        // Optional auto-send the message after recognition
        // handleSendMessage(new Event('submit')); // Trigger form submission
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (
          event.error === "not-allowed" ||
          event.error === "permission-denied"
        ) {
          alert(
            "Microphone access denied. Please enable it in your browser settings to use voice input."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended.");
      };

      recognitionRef.current = recognition;
    } else {
      console.warn(
        "Web Speech API (webkitSpeechRecognition) not supported in this browser."
      );
    }

    // Speech Synthesis setup
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn(
        "Web Speech API (Speech Synthesis) not supported in this browser."
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel(); // Stop any ongoing speech
      }
    };
  }, []);

  // Effect to load conversation history when initialConversationId prop changes
  useEffect(() => {
    const loadHistory = async () => {
      if (initialConversationId) {
        // Load history only if an id is provided
        setIsLoadingHistory(true);
        try {
          const logs = await fetchConversationLogs(initialConversationId);
          const formattedMessages = logs.map((log) => ({
            sender: log.is_persona_response ? "persona" : "user",
            text: log.statement,
            disposition: log.disposition,
            emoji: log.emoji,
          }));
          setMessages(formattedMessages);
          setConversationId(initialConversationId);
        } catch (error) {
          console.error("Error loading conversation history:", error);
          setMessages([
            { sender: "system", text: "Failed to load conversation history." },
          ]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // If no conversationId, clear messages for a new conversation
        setMessages([]);
        setConversationId(null);
      }
    };

    loadHistory();
  }, [initialConversationId, personaId]); // Depend on conversationId and personaId

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Use the current conversationId state, or null for a new convseration
      const response = await chatWithPersona(personaId, input, conversationId);
      const personaResponse = {
        sender: "persona",
        text: response.response,
        disposition: response.disposition,
        emoji: response.emoji,
      };
      setMessages((prevMessages) => [...prevMessages, personaResponse]);
      // Update conversationId if a new one is returned
      setConversationId(response.conversation_id || conversationId);

      // Text-to-Speech for persona's response
      if (synthRef.current && personaResponse.text) {
        // Use default system voice for now. Can change later
        const utterance = new SpeechSynthesisUtterance(personaResponse.text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        synthRef.current.speak(utterance);
      }
    } catch (error) {
      console.error("Error chatting:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "system",
          text: `Error: ${
            error.message || "Could not get a response from the persona."
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-300 rounded-xl shadow-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center p-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="ml-2 text-gray-600">
              Loading conversation history...
            </p>
          </div>
        ) : messages.length === 0 && !conversationId ? (
          <p className="text-center text-gray-500 mt-10">
            Start a new conversation with this persona!
          </p>
        ) : messages.length === 0 && conversationId ? (
          <p className="text-center text-gray-500 mt-10">
            No messages found for this conversation.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-xl max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                } shadow-sm`}
              >
                <p className="font-semibold mb-1">
                  {msg.sender === "user" ? "You" : personaName}
                  {msg.sender === "persona" && msg.emoji && ` ${msg.emoji}`}
                </p>
                <p>{msg.text}</p>
                {msg.sender === "persona" && msg.disposition && (
                  <p className="text-xs text-gray-400 mt-1">
                    Disposition: {msg.disposition}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 flex space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || isListening || isLoadingHistory}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-lg shadow-md transition duration-200 ease-in-out
                                ${
                                  isListening
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-gray-400 hover:bg-gray-500"
                                }
                                text-white font-bold disabled:opacity-50`}
          disabled={
            loading ||
            !("webkitSpeechRecognition" in window) ||
            isLoadingHistory
          }
          title={isListening ? "Stop Listening" : "Start Voice Input"}
        >
          {isListening ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h2m6 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2m-6 0v12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3h-4zM4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1h3a1 1 0 000-2h-3v-3a7 7 0 00-14 0v3H1a1 1 0 100 2h3zm9 3a1 1 0 100-2h-2a1 1 0 100 2h2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transition duration-200 ease-in-out"
          disabled={loading || isListening || isLoadingHistory}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
