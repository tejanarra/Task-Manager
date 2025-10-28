import TaskItem from "../taskItem/TaskItem";

const TaskPreviewModal = ({ theme, task, onClose, onSave }) => (
  <div className="ai-preview-overlay" onClick={onClose}>
    <div className="ai-preview-modal" onClick={(e) => e.stopPropagation()}>
      <h5 className="mb-3">
        <i className="bi bi-eye"></i> Task Preview
      </h5>

      <TaskItem
        theme={theme}
        task={task}
        isNewTask={true}
        onSave={onSave}
        onCancel={onClose}
      />

      <div className="text-end mt-2">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default TaskPreviewModal;
