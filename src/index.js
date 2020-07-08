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
  } = useStorage();

  const [showCompletedItems, setShowCompletedItems] = React.useState(false);

  const textArea = React.useRef();

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
  }, [onSave]);

  React.useEffect(() => {
    if (isSaved) window.document.title = initialPageTitle;
    else window.document.title = `* ${initialPageTitle}`;
  }, [isSaved]);

  const allItems = text.split(/(?:^|\n)-/).map((rawItem, index) => ({
    rawItem,
    item: rawItem.replace(/(^[\n\s]+)|([\n\s]+$)/g, ""),
    index,
  }));
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
        id="list"
        checked={false}
        items={allItems.filter(({ item }) => item.length > 0)}
        onCheckboxCheck={({ item, rawItem, index }) => {
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
        }}
      />
      {showCompletedItems && (
        <ItemsList
          id="completed"
          checked
          items={completedItems}
          onCheckboxCheck={({ item, rawItem, index }) => {
            setCompletedItems((completedItems) =>
              completedItems.filter((_, i) => i !== index)
            );
            setText((text) => `${text.replace(/\n$/, "")}\n-${rawItem}`);
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
