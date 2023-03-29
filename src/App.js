import "./styles.css";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const chatHistoryRef = useRef(null);
  const [showModal, setShowModal] = useState(true); // new state to control modal display
  const [studentName, setStudentName] = useState("Saavi");
  const [studentClass, setStudentClass] = useState("IB PYP grade 3");
  const [studentSubject, setStudentSubject] = useState("Maths");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async (message) => {
    const newMessage = { role: "user", content: message };
    const newChatHistory = [...chatHistory, newMessage];

    setChatHistory(newChatHistory);
    setLoading(true);
    setError(null);

    try {

      const response = await axios.post(
        `https://fair-cyan-indri-robe.cyclic.app/openai-chat`,
        {
          model: "gpt-3.5-turbo",
          messages: newChatHistory,
        }
      );      

      // const response = await axios.post(
      //   "https://api.openai.com/v1/chat/completions",
      //   {
      //     model: "gpt-3.5-turbo",
      //     messages: newChatHistory,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${process.env.REACT_APP_OPENAI_SECRET}`,
      //     },
      //   }
      // );

      console.log(response);
      setLoading(false);

      const chatbotMessage = response.data.choices[0].message.content;

      const updatedChatHistory = [
        ...newChatHistory,
        { role: "assistant", content: chatbotMessage },
      ];

      setChatHistory(updatedChatHistory);
      setInputValue("");
      inputRef.current.focus();
    } catch (error) {
      setLoading(false);
      setError("Oops! Something went wrong. Please try again later.");
      console.error(error);
    }
  };

  const handleStart = () => {
    sendMessage("Please start the test");
    const startButton = document.getElementById("start-button");
    startButton.style.display = "none";
  };

  const handleOption = (option) => {
    sendMessage(option);
  };

  const handleSkip = () => {
    sendMessage(
      "Skip this question. Explain me the answer & move ahead to the next question"
    );
  };

  const handleHint = () => {
    sendMessage(
      "Please help me by breaking down the problem in simple steps. Donot Answer me. help be figure out my own answer."
    );
  };

  useEffect(() => {
    // scroll chat history to the bottom on every update
    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    inputRef.current.focus();
  }, [chatHistory]);

  return (
    <div className="chatbot">
      {showModal && ( // display modal if `showModal` is true
        <div className="modal-overlay">
          <div className="modal">
            <label>
              Student name:
              <input
                type="text"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
              />
            </label>
            <label>
              Class/Course:
              <input
                type="text"
                value={studentClass}
                onChange={(event) => setStudentClass(event.target.value)}
              />
            </label>
            <label>
              Subject:
              <input
                type="text"
                value={studentSubject}
                onChange={(event) => setStudentSubject(event.target.value)}
              />
            </label>
            <button
              className="btn-start-test"
              onClick={() => {
                setChatHistory([
                  {
                    role: "system",
                    content: ` you are a ${studentSubject} examiner for ${studentClass}. conduct test for a student called ${studentName}. Ask a multiple choice question. 
                    
                    Wait for the answer. Once the student submits correct answer, give them an instant feedback and then ask an another question.
    
                    In case the student's answer is incorrect, provide them with hints by breaking down the problem into simpler steps before moving on to the next question. Moreover, ensure that the subsequent question is easier than the previous incorrectly answered question to help prepare the student for the more difficult ones. Once the student successfully answers the simpler question, return to a similar question to the one they had answered incorrectly earlier.
                  
                    Ask 40 questions with four options. Each question should carry one marks. 
                  
                    At the end of the test give them total marks and the list of questions that they were not able to answer. 
                  
                    Form question number 10 onwards, include harder ${studentSubject} word problems, if applicable. 
                  
                    Keep track of the time taken to answer each question. 
                  
                    Summarise the total marks, time taken & all the questions and their answers at the end of the test.
                  `,
                  },
                ]);

                setShowModal(false);
              }}
            >
              Prepare questions for me!
            </button>
            <br /><br />
            <div><em>BETA Alert! At times i found that the correct answer suggested by the BOT may be wrong. Parent's supervision is advised.</em></div>
          </div>
        </div>
      )}

      <h2> MCQ Buddy - Mutlple choice question Bot (24x7 Available) </h2>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((message, index) => (
          <code key={index} className={`message-${message.role}`}>
            <pre>{message.content}</pre>
          </code>
        ))}
      </div>
      <div className="chat-input">

        <div className="buttons-container">
          
          <button
            className="button-start"
            id="start-button"
            onClick={handleStart}
          >
            Start the test
          </button>
          
          <button className="button-option" onClick={() => handleOption("a")}>
            a
          </button>
          
          <button className="button-option" onClick={() => handleOption("b")}>
            b
          </button>
          
          <button className="button-option" onClick={() => handleOption("c")}>
            c
          </button>
          
          <button className="button-option" onClick={() => handleOption("d")}>
            d
          </button>
          
          <button className="button-skip" onClick={handleSkip}>
            Skip
          </button>
          
          <button className="button-hint" onClick={handleHint}>
            Hint
          </button>

        </div>

        <textarea
          rows="3"
          placeholder="Type your message here if required. Most most part, clicking the buttons at the left would work. Press shift + enter for multi line input."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage(inputValue);
            }
          }}
          disabled={loading}
          ref={inputRef}
        />
        {error && <div className="error">{error}</div>}
      </div>

      {loading && (
        <div className="loading-animation">
          <div className="ball"></div>
          <div className="ball"></div>
          <div className="ball"></div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Chatbot />
    </div>
  );
}
