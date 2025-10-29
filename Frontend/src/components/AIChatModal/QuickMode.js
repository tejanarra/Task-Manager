import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateAITask } from "../../services/api";

const QuickMode = ({ setError, onClose }) => {
  const navigate = useNavigate();
  const [quickPrompt, setQuickPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleQuickGenerate = async () => {
    if (!quickPrompt.trim()) return;
    setIsLoading(true);
    setError(null);

    const result = await generateAITask(quickPrompt);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const aiTask = result.data;
    const newTask = {
      title: aiTask.title,
      description: aiTask.description,
      status: aiTask.status || "not-started",
      deadline: aiTask.deadline,
      reminders: aiTask.reminders || [],
    };

    // Close modal and navigate to editor with task data
    onClose();
    navigate("/tasks/new/edit", { state: { task: newTask } });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickGenerate();
    }
  };

  return (
    <div className="quick-mode">
      <div className="quick-mode-content">
        <label className="form-label">Describe your task:</label>
        <textarea
          ref={inputRef}
          className="form-control"
          rows={4}
          value={quickPrompt}
          onChange={(e) => setQuickPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="E.g., 'Prepare project report by Friday 5PM with reminders 1 day and 1 hour before'"
          disabled={isLoading}
        />
        <div className="quick-mode-suggestions">
          <small>Try these:</small>
          {[
            "Schedule dentist appointment next Tuesday at 3pm",
            "Plan weekend shopping with 1 day reminder",
            "Prepare presentation for Monday with daily reminders",
          ].map((text) => (
            <button
              key={text}
              className="suggestion-chip"
              onClick={() => setQuickPrompt(text)}
              disabled={isLoading}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="btn btn-secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleQuickGenerate}
          disabled={!quickPrompt.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>{" "}
              Generating...
            </>
          ) : (
            <>
              <i className="bi bi-magic me-2"></i> Generate Task
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickMode;
