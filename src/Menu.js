import React from "react";
import useStorage from "./useStorage";

const Menu = ({ onShowCompletedItems, showCompletedItems }) => {
  const { onSave, isSaved, reloadFromDatabase, undo, canUndo } = useStorage();
  return (
    <nav>
      {canUndo && (
        <>
          <button onClick={undo}>Undo</button>{" "}
        </>
      )}
      <button onClick={onSave}>Save (^S)</button>{" "}
      {!isSaved ? "(not saved)" : ""}{" "}
      <button onClick={() => onShowCompletedItems((v) => !v)}>
        {!showCompletedItems ? "Show completed items" : "Hide completed items"}
      </button>{" "}
      {!isSaved && (
        <button onClick={reloadFromDatabase}>Reload from local storage</button>
      )}
    </nav>
  );
};

export default Menu;
