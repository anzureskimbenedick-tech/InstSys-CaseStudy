import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import TypewriterText from "../utils/TypeWriter.jsx";
import VoiceInput from "../utils/voiceInput.jsx";
import AudioVisualizer from "../utils/audioVisualizer.jsx";
import { usePuter } from "../components/usePuter.js";
import "../css/chatPrompt.css";

function AiChat({
  messages,
  input,
  setInput,
  handleSubmit,
  boxRef,
  studentData,
  sendMessage,
  response,
}) {
  const [micON, setMicOn] = useState(false);
  const [holoOn, setHoloOn] = useState(false);
  const [visualizerStream, setVisualizerStream] = useState(null);
  const puterSpeak = usePuter();

  // ========================
  // Text-to-Speech Handling
  // ========================
  useEffect(() => {
    const speakResponse = async () => {
      if (!response) return;
      const result = await puterSpeak(response, { voice: "Lupe" });
      if (result) setVisualizerStream(result);
    };
    if (holoOn) speakResponse();
  }, [response]);

  // ========================
  // Toggles
  // ========================
  const toggleMic = () => setMicOn((prev) => !prev);
  const toggleHolo = () => setHoloOn((prev) => !prev);

  const submitVoiceInput = (text) => {
    sendMessage(text);
    setInput("");
  };

  // ========================
  // Main Layout Animation Variants
  // ========================
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.4, ease: "easeOut" },
    }),
  };

  // ========================
  // UI Rendering
  // ========================
  return (
    <>
      {/* ======================
          MAIN CHAT LAYOUT
      ====================== */}
      <AnimatePresence mode="wait">
        {!holoOn && (
          <motion.div
            key="chat-layout"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full flex flex-col items-center justify-between py-5 mr-2"
          >
            {/* Header */}
            <motion.div
              variants={childVariants}
              custom={0.1}
              initial="hidden"
              animate="visible"
              className="w-full h-[10%] flex flex-col gap-2 items-center"
            >
              <div className="flex justify-between w-[90%]">
                <div className="flex items-center">
                  <div className="bg-[url('/navIco/iconAI.svg')] bg-contain bg-no-repeat w-[3vw] aspect-square"></div>
                  <h1 className="text-[clamp(1.3rem,1.2vw,1.8rem)] font-sans font-medium">
                    Intelligent System
                  </h1>
                </div>
                <div className="flex gap-2 items-center">
                  <h1 className="text-[clamp(1.3rem,1.2vw,1.8rem)] font-sans font-medium">
                    {studentData
                      ? `${studentData.firstName} ${studentData.lastName}`
                      : "User Account"}
                  </h1>
                  <div className="bg-[url('/navIco/profile-circle.svg')] bg-contain bg-no-repeat w-[3vw] aspect-square"></div>
                </div>
              </div>
              <div className="w-[90%] h-1 rounded-2xl bg-gray-500"></div>
            </motion.div>

            {/* Chat Box */}
            <motion.div
              variants={childVariants}
              custom={0.2}
              initial="hidden"
              animate="visible"
              className="chatBox flex flex-col justify-between items-center w-[95%] h-[85%] rounded-lg !p-4"
            >
              {/* Messages */}
              <div
                ref={boxRef}
                className="box relative flex flex-col w-[90%] h-[90%] gap-4 overflow-y-auto p-4 rounded-lg"
              >
                {messages
                  .filter(
                    (msg) => msg.type !== "uploading" && msg.type !== "uploaded"
                  )
                  .map((msg, i) => {
                    const isBotResponse =
                      msg.sender === "bot" && msg.type !== "loading";
                    const isLastMessage = i === messages.length - 1;

                    return (
                      <div
                        key={i}
                        className={`content p-2 rounded-lg max-w-[90%] ${
                          msg.type === "userUpload"
                            ? "userUploaded bg-amber-600 text-white px-4 py-2 max-w-xs self-end rounded-lg rounded-br-none shadow-md"
                            : msg.sender === "user"
                            ? "userRespo bg-amber-600 text-white px-4 py-2 max-w-xs self-end rounded-lg rounded-br-none shadow-md shadow-gray-400"
                            : msg.type === "schedule" ||
                              msg.type === "who" ||
                              msg.type === "record"
                            ? "bg-amber-100 border border-gray-200 self-start text-lg whitespace-pre-wrap break-words rounded-sm rounded-bl-none shadow-inner shadow-gray-400/40 inset !text-gray-900 p-4 border-l-4 border-l-amber-300"
                            : msg.type === "loading"
                            ? "bg-gray-600/50 w-20 self-start !rounded-sm shadow-sky-100/90 shadow-inner"
                            : "bg-amber-200 botRespo self-start break-words rounded-lg rounded-bl-none shadow-md shadow-gray-400 !text-gray-900"
                        }`}
                      >
                        {msg.type === "loading" ? (
                          <div className="flex gap-1 w-full items-center">
                            <span className="chatLoader"></span>
                          </div>
                        ) : isBotResponse && isLastMessage ? (
                          <TypewriterText text={msg.text} speed={18} />
                        ) : (
                          msg.text
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Input Box */}
              <motion.div
                variants={childVariants}
                custom={0.3}
                initial="hidden"
                animate="visible"
                className="searchBox component w-[90%] h-[3vw] !mt-4 px-[0.5rem] gap-2 flex flex-row bg-gray-50 justify-center items-center"
              >
                <div className="w-full h-[70%] flex items-center">
                  {/* Holo Toggle */}
                  <button
                    onClick={() => {
                      toggleHolo();
                      toggleMic();
                    }}
                    className="mic rounded-full w-[2.5vw] h-[2.5vw] mr-1 aspect-square flex items-center justify-center cursor-pointer transition-transform transform-gpu duration-300 hover:scale-105 bg-gray-300 p-2 shadow-black/30 shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 28"
                      fill="none"
                      className="w-[1.8vw] h-[2.4vw] text-black"
                    >
                      <path
                        d="M4 4h16a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-7l-3.5 4L10 21H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="8"
                        y1="11"
                        x2="8"
                        y2="15"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="9"
                        x2="12"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <line
                        x1="16"
                        y1="11"
                        x2="16"
                        y2="15"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* Input or Voice */}
                  {!micON ? (
                    <form
                      onSubmit={handleSubmit}
                      className="w-full h-full flex justify-center items-center"
                      title="Ask a question or type a command"
                    >
                      <input
                        type="text"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-full !p-4 font-sans text-[clamp(0.6rem,1.3vw,1.5rem)] focus:outline-none focus:ring-0"
                      />
                    </form>
                  ) : (
                    <VoiceInput
                      setInput={setInput}
                      micON={micON}
                      sendMessage={sendMessage}
                      toggleMic={toggleMic}
                    />
                  )}
                </div>

                {/* Mic Button */}
                <button
                  onClick={toggleMic}
                  className={`mic rounded-full w-[2.5vw] h-[2.5vw] mr-1 flex items-center justify-center cursor-pointer transition-transform transform-gpu duration-300 hover:scale-102 ${
                    micON
                      ? "bg-red-500/60 shadow-gray-800 shadow-md"
                      : "hover:bg-gray-300/70"
                  }`}
                  title="Voice Input"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-[1.8vw] h-[1.8vw] text-black"
                  >
                    <path
                      d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z"
                      stroke="#000"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 11V12C19 15.3137 16.3137 18 13 18H11C7.68629 18 5 15.3137 5 12V11"
                      stroke="#000"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18V22"
                      stroke="#000"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSubmit}
                  className="send bg-gray-400/50 shadow-gray-500 shadow-sm rounded-full w-[2.5vw] h-[2.5vw] aspect-square rotate-45 flex items-center justify-center cursor-pointer duration-300 hover:bg-gray-500/70"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="1 -2 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[2vw] h-[2vw] text-black"
                  >
                    <path d="M22 2L11 13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================
          HOLO OVERLAY (outside main layout)
      ====================== */}
      <AnimatePresence>
        {holoOn && (
          <motion.div
            key="holo-overlay"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col items-center justify-center p-5 bg-[linear-gradient(to_top,rgba(23,23,23,0.9),rgba(64,64,64,0.7)),url('/images/PDM-Facade.png')] bg-no-repeat bg-center bg-cover z-50"
          >
            <AudioVisualizer
              toggleHolo={toggleHolo}
              toggleMic={toggleMic}
              audioStream={visualizerStream}
            />
            <VoiceInput
              setInput={setInput}
              micON={micON}
              sendMessage={sendMessage}
              toggleMic={toggleMic}
              mode={holoOn}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiChat;
