import React from "react";
import format from "date-fns/format";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import "./index.css";

const pageTitle = window.document.title;

const LOCAL_STORAGE_TEXT_KEY = "text";
const LOCAL_STORAGE_COMPLETED_ITEMS = "completed_items";

const savedText = window.localStorage.getItem(LOCAL_STORAGE_TEXT_KEY) ?? "";
const savedCompletedItems = JSON.parse(
  window.localStorage.getItem(LOCAL_STORAGE_COMPLETED_ITEMS) ?? "[]"
);

const App = () => {
  const [destinationFile, setDestinationFile] = React.useState();

  const [text, setText] = React.useState(savedText);
  const [completedItems, setCompletedItems] = React.useState(
    savedCompletedItems
  );

  const [isSaved, setIsSaved] = React.useState(true);
  const [showCompletedItems, setShowCompletedItems] = React.useState(false);

  const textArea = React.useRef();

  const onSave = React.useCallback(async () => {
    window.localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, text);
    window.localStorage.setItem(
      LOCAL_STORAGE_COMPLETED_ITEMS,
      JSON.stringify(completedItems)
    );
    setIsSaved(true);
    let handle = destinationFile;
    if (!handle) {
      handle = await window.chooseFileSystemEntries({
        type: "save-file",
      });
      setDestinationFile(handle);
    }

    const writer = await handle.createWritable();
    await writer.write({
      type: "write",
      data: text,
    });
    await writer.close();
  }, [text, completedItems, destinationFile]);

  React.useEffect(() => {
    const textAreaNode = textArea.current;
    const onCtrlS = async (e) => {
      if ((e.ctrlKey === true || e.metaKey === true) && e.key === "s") {
        e.preventDefault();
        await onSave();
      }
    };
    textAreaNode.addEventListener("keydown", onCtrlS);
    return () => textAreaNode.removeEventListener("keydown", onCtrlS);
  }, [text, onSave]);

  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsSaved(window.localStorage.getItem(LOCAL_STORAGE_TEXT_KEY) === text);
  }, [text]);

  React.useEffect(() => {
    if (isSaved) window.document.title = pageTitle;
    else window.document.title = `* ${pageTitle}`;
  }, [isSaved]);

  const allItems = text.split("-").map((rawItem, index) => ({
    rawItem,
    item: rawItem.replace(/(^[\n\s]+)|([\n\s]+$)/g, ""),
    index,
  }));

  return (
    <div>
      <nav>
        <button onClick={onSave}>Save (^S)</button>{" "}
        {!isSaved ? "(not saved)" : ""}{" "}
        <button onClick={() => setShowCompletedItems((v) => !v)}>
          {!showCompletedItems
            ? "Show completed items"
            : "Hide completed items"}
        </button>
      </nav>
      <textarea
        ref={textArea}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <ul id="list">
        {allItems
          .filter(({ item }) => item.length > 0)
          .map(({ item, rawItem, index }) => (
            <li>
              <input
                type="checkbox"
                checked={false}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCompletedItems((completedItems) => [
                      ...completedItems,
                      {
                        rawItem,
                        item,
                        date: format(new Date(), "yyyy-MM-dd HH:MM"),
                      },
                    ]);
                    setText(
                      allItems
                        .filter((_, i) => i !== index)
                        .map(({ rawItem }) => rawItem)
                        .join("-")
                    );
                  }
                }}
              />{" "}
              {item}
            </li>
          ))}
      </ul>
      {showCompletedItems && (
        <ul id="completed">
          {completedItems.length === 0 && "Empty"}
          {completedItems.map(({ rawItem, item, date }, index) => (
            <li>
              <input
                type="checkbox"
                checked
                onChange={(e) => {
                  if (!e.target.checked) {
                    setCompletedItems((completedItems) =>
                      completedItems.filter((_, i) => i !== index)
                    );
                    setText(
                      (text) => `${text.replace(/\n$/, "")}\n-${rawItem}`
                    );
                  }
                }}
              />{" "}
              {rawItem} (on {date})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  window.document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
