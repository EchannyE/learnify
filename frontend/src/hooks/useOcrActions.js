
import { useNavigate } from "react-router-dom";

export default function useOcrActions() {
  const navigate = useNavigate();

  const handleOcrAction = ({ action, noteId }) => {
    if (!noteId) return;

    if (action === "quiz") {
      navigate(`/quiz?noteId=${noteId}`);
    }

    if (action === "tutor") {
      navigate(`/tutor?noteId=${noteId}`);
    }

    if (action === "planner") {
      navigate(`/study-planner?noteId=${noteId}`);
    }
  };

  return { handleOcrAction };
}