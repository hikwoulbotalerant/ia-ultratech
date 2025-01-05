'use client'; // Directive pour marquer ce fichier comme composant côté client

import { useEffect, useState, useRef } from "react";
import { Mistral } from "@mistralai/mistralai";

const Home = () => {
  const [response, setResponse] = useState<string[]>([]); // Réponses sous forme de tableau
  const [input, setInput] = useState<string>(""); // Texte du formulaire
  const [loading, setLoading] = useState<boolean>(false); // Etat de chargement
  const [conversationStarted, setConversationStarted] = useState<boolean>(false); // Etat de la conversation
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Référence du conteneur de messages

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroller vers le bas quand la réponse change
  }, [response]);

  const fetchChatResponse = async (userMessage: string) => {
    const apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || "2w4hNjRRFLFqP5WdvTWARN5WFPHAGnil";

    const client = new Mistral({ apiKey: apiKey });

    setLoading(true);
    try {
      // Envoi des messages sous un format où le dernier est toujours un message de l'utilisateur
      const chatResponse = await client.chat.complete({
        model: "mistral-tiny",
        messages: [
          // Messages précédents de l'assistant et de l'utilisateur
          ...response.map((msg) => ({ role: "assistant", content: msg })),
          { role: "user", content: userMessage }, // Dernier message de l'utilisateur
        ],
      });

      setResponse((prev) => [
        ...prev,
        chatResponse.choices[0].message.content,
      ]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setResponse((prev) => [
        ...prev,
        "Error occurred while fetching data.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    setResponse((prev) => [...prev, `Vous: ${input}`]); // Ajouter le message de l'utilisateur avec "vous"
    fetchChatResponse(input); // Appeler l'IA avec le message de l'utilisateur
    setInput(""); // Réinitialiser le champ de texte
    setConversationStarted(true); // La conversation a commencé
  };

  return (
    <section className="container mx-auto px-6 md:px-0">
      {/* Section en haut à gauche */}
      <div className="dark bg-muted px-4 py-3 text-foreground w-screen fixed top-0 left-0 z-10">
        <div className="flex gap-3 items-center justify-between w-full">
          <nav className="flex gap-2 items-center">
            <a
              className="group flex items-center gap-2 hover:text-blue-400 text-white transition-colors"
              href="https://hiksont-talerant.vercel.app/"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform transition-transform group-hover:-translate-x-1"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              <img
                alt="Hikson Taleant"
                loading="lazy"
                width="32"
                height="32"
                decoding="async"
                className="mt-0.5 shrink-0 rounded-full size-[32px]"
                style={{ color: "transparent" }}
                srcSet="/_next/image?url=%2Fhikson.jpg&amp;w=32&amp;q=75 1x, /_next/image?url=%2Fhikson.jpg&amp;w=64&amp;q=75 2x"
                src="/_next/image?url=%2Fhikson.jpg&amp;w=64&amp;q=75"
              />
              <span className="text-white/50 group-hover:text-blue-400 transition-colors">
                back to <span className="underline decoration-2 underline-offset-2">portfolio Hikson Talerant</span>
              </span>
            </a>
          </nav>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-2xl py-24 mx-auto text-neutral-100">
        {/* Section d'introduction avec titre et description */}
        {!conversationStarted && (
          <div className="space-y-4 overflow-y-auto">
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Hikson Taleant
                </h1>
                <p className="text-gray-400">Comment puis-je vous aider aujourd&#x27;hui ?</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <button className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <h3 className="font-semibold text-blue-400">Compétences</h3>
                  <p className="text-sm text-gray-400">Parle-moi de tes compétences en développement</p>
                </button>
                <button className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <h3 className="font-semibold text-purple-400">Projets récents</h3>
                  <p className="text-sm text-gray-400">Quels sont tes projets les plus récents ?</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteneur des réponses */}
        <div
          ref={chatContainerRef}
          className="space-y-4 overflow-y-auto p-4"
          style={{ maxHeight: "70vh" }}
        >
          {response.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all text-white"
                  : "bg-gray-200 border border-blue-500/20 hover:border-blue-500/40 transition-all text-gray-900"
              }`}
            >
              {message.startsWith("Vous: ") ? (
                <div className="font-semibold text-white">{message}</div>
              ) : (
                <div className="font-semibold text-gray-900">UltraIA: {message}</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-gray-500">UltraIA est en train de taper...</div>
          )}
        </div>

        {/* Formulaire d'interaction avec l'IA */}
        <form
          onSubmit={handleSubmit}
          className="fixed bottom-5 max-w-2xl mx-auto w-[85%] md:w-full"
        >
          <div className="relative">
            <input
              placeholder="Posez votre question..."
              className="w-full rounded-2xl border border-slate-800 bg-black px-4 py-3 pr-24 text-slate-200 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Home;
