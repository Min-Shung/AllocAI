import React from "react";
import Checkbox from "./Checkbox";
import ReasonSelect from "./ReasonSelect";

export default function TaskItem({
  task,
  storyId,
  checkedItems,
  toggleCheck,
  reasonMap,
  customReasonMap,
  handleReasonChange,
  handleCustomReasonChange,
  taskReasons
}) {
  const show = checkedItems[task._id];
  return (
    <div key={task._id}>
      <Checkbox
        label={task.name}
        checked={!!checkedItems[task._id]}
        onChange={() => toggleCheck(task._id, "task", storyId)}
      />
      {show && (
        <ReasonSelect
          id={task._id}
          type="task"
          reasonMap={reasonMap}
          customReasonMap={customReasonMap}
          handleReasonChange={handleReasonChange}
          handleCustomReasonChange={handleCustomReasonChange}
          reasonOptions={taskReasons}
        />
      )}
    </div>
  );
}