import { useLocation } from "react-router-dom";
import Mcqs from "./Mcqs";
import Blanks from "./Blanks";
import TF from "./TF";
import Flashcards from "./Flashcards ";

const QuizApp = () => {
  const location = useLocation();
  const { Data, quizType, quizId } = location.state || {}; // Using optional chaining to avoid errors if state is undefined
  const quizData = Data ? JSON.parse(Data) : [];

  // const renderMCQs = (quiz) => {
  //   return quiz && quiz.length > 0 ? quiz.map((item, index) => (
  //     <div key={index} className="mb-4">
  //       <p className="text-white font-bold">{item.question}</p>
  //       <div className="text-white">
  //         {item.options?.map((option, i) => (
  //           <label key={i} className="block">
  //             <input type="radio" name={item.question} value={option} />
  //             {option}
  //           </label>
  //         ))}
  //       </div>
  //     </div>
  //   )) : <p className="text-white">No MCQs available.</p>;
  // };
  
  // const renderBlanks = (quiz) => {
  //   return quiz && quiz.length > 0 ? quiz.map((item, index) => (
  //     <div key={index} className="mb-4">
  //       <p className="text-white font-bold">{item.question}</p>
  //       <input
  //         type="text"
  //         placeholder="Fill in the blank"
  //         className="w-full px-2 py-1 rounded-md"
  //       />
  //     </div>
  //   )) : <p className="text-white">No blank questions available.</p>;
  // };

  // const renderTF = (quiz) => {
  //   return quiz && quiz.length > 0 ? quiz.map((item, index) => (
  //     <div key={index} className="mb-4">
  //       <p className="text-white font-bold">{item.question}</p>
  //       <div className="text-white">
  //         <label className="block">
  //           <input type="radio" name={item.question} value="True" />
  //           True
  //         </label>
  //         <label className="block">
  //           <input type="radio" name={item.question} value="False" />
  //           False
  //         </label>
  //       </div>
  //     </div>
  //   )) : <p className="text-white">No True/False questions available.</p>;
  // };

  const renderFlashcards = (quiz) => {
    return quiz && quiz.length > 0 ? quiz.map((item, index) => (
      <div key={index} className="mb-4">
        <p className="text-white font-bold">{item.question}</p>
        <div className="text-white">
          <button
            onClick={() => alert(`The correct answer is: ${item.correctAnswer}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Show Answer
          </button>
        </div>
      </div>
    )) : <p className="text-white">No flashcards available.</p>;
  };

  const getQuizTypeUI = (quizType) => {
    switch (quizType) {
      case "mcqs":
        return <Mcqs quiz={quizData} quizId={quizId}/>;
      case "blanks":
        return <Blanks quiz={quizData} quizId={quizId}/>;
      case "T/F":
        return <TF quiz={quizData} quizId={quizId}/>;
      case "flashcards":
        return <Flashcards quiz={quizData} quizId={quizId}/>;
      default:
        return <div>No quiz type selected</div>;
    }
  };

  return (
    <div className="text-white ">
      {/* <h1 className="text-center text-gray-400 text-4xl font-Fredoka">
        Quiz - {quizType ? quizType.toUpperCase() : 'No Type Selected'}
      </h1> */}
      <div className="mt-8">{getQuizTypeUI(quizType)}</div>
    </div>
  );
};

export default QuizApp;
