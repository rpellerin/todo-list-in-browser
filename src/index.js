import React from "react";
import format from "date-fns/format";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import "./index.css";
import Menu from "./Menu";
import ItemsList from "./ItemsList";
import useStorage, { StorageProvider } from "./useStorage";

const initialPageTitle = window.document.title;

const App = () => {
  const {
    onSave,
    isSaved,
    text,
    setText,
    setCompletedItems,
    completedItems,
    undo,
  } = useStorage();

  const [showCompletedItems, setShowCompletedItems] = React.useState(false);

  const textArea = React.useRef();

  React.useEffect(() => {
    const textAreaNode = textArea.current;
    const onKeyDownInTextArea = async (e) => {
      if ((e.ctrlKey === true || e.metaKey === true) && e.key === "s") {
        e.preventDefault();
        await onSave();
      }
      if ((e.ctrlKey === true || e.metaKey === true) && e.key === "z") {
        e.stopPropagation();
        undo({ updateText: false });
      }
    };
    textAreaNode.addEventListener("keydown", onKeyDownInTextArea);
    return () =>
      textAreaNode.removeEventListener("keydown", onKeyDownInTextArea);
  }, [onSave, undo]);

  React.useEffect(() => {
    if (isSaved) window.document.title = initialPageTitle;
    else window.document.title = `* ${initialPageTitle}`;
  }, [isSaved]);

  const textToLineArray = text.split("\n").map((rawLine, index) => ({
    rawLine,
    index,
  }));

  const nonCompletedItems = textToLineArray
    .filter(({ rawLine }) => rawLine.match(/^\s*-/))
    .map(({ rawLine, index }) => ({
      rawLine,
      index,
      line: rawLine.replace(/^\s*-\s*/g, ""),
    }))
    .filter(({ line }) => line.length > 0);
  return (
    <div>
      <Menu
        onShowCompletedItems={() => setShowCompletedItems((v) => !v)}
        showCompletedItems={showCompletedItems}
      />
      <textarea
        ref={textArea}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <ItemsList
        render={({ line }) => line}
        id="list"
        checked={false}
        items={nonCompletedItems}
        onCheckboxCheck={({ line, rawLine, index }) => {
          setCompletedItems((completedItems) => [
            ...completedItems,
            {
              rawLine,
              line,
              date: format(new Date(), "yyyy-MM-dd HH:MM"),
            },
          ]);
          setText(
            textToLineArray
              .filter((_, i) => i !== index)
              .map(({ rawLine }) => rawLine)
              .join("\n")
          );
        }}
      />
      {showCompletedItems && (
        <ItemsList
          render={({ line, date }) => `${line} (on ${date})`}
          id="completed"
          checked
          items={completedItems}
          onCheckboxCheck={({ rawLine }, index) => {
            setCompletedItems((completedItems) =>
              completedItems.filter((_, i) => i !== index)
            );
            setText((text) => `${rawLine}\n${text}`);
          }}
        />
      )}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <StorageProvider>
      <App />
    </StorageProvider>
  </React.StrictMode>,
  window.document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
