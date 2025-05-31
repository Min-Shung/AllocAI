import React from "react";
import Checkbox from "./Checkbox";
import ReasonSelect from "./ReasonSelect";
import TaskItem from "./TaskItem";

export default function StoryItem({
  story,
  checkedItems,
  toggleCheck,
  reasonMap,
  customReasonMap,
  handleReasonChange,
  handleCustomReasonChange,
  storyReasons,
  taskReasons
}) {
  const isChecked = !!checkedItems[story._id];
  const taskIds = Array.isArray(story.tasks) ? story.tasks.map((t) => t._id) : [];

  return (
    <div key={story._id} style={{marginTop: 10 }}>
      <Checkbox
        label={<span style={{ fontWeight: "bold" }}>{story.name}</span>}
        checked={isChecked}
        onChange={() => toggleCheck(story._id, "story", null, taskIds)}
      />
      {isChecked ? (
        <ReasonSelect
          id={story._id}
          type="story"
          reasonMap={reasonMap}
          customReasonMap={customReasonMap}
          handleReasonChange={handleReasonChange}
          handleCustomReasonChange={handleCustomReasonChange}
          reasonOptions={storyReasons}
        />
      ) : (
        story.tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            storyId={story._id}
            checkedItems={checkedItems}
            toggleCheck={toggleCheck}
            reasonMap={reasonMap}
            customReasonMap={customReasonMap}
            handleReasonChange={handleReasonChange}
            handleCustomReasonChange={handleCustomReasonChange}
            taskReasons={taskReasons}
          />
        ))
      )}
    </div>
  );
}