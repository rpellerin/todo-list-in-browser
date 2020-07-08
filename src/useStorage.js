import React from "react";

const isFunction = (value) =>
  value &&
  (Object.prototype.toString.call(value) === "[object Function]" ||
    "function" === typeof value ||
    value instanceof Function);

const LOCAL_STORAGE_TEXT_KEY = "text";
const LOCAL_STORAGE_COMPLETED_ITEMS = "completed_items";

const getSavedTextFromLocalStorage = () =>
  window.localStorage.getItem(LOCAL_STORAGE_TEXT_KEY) ?? "";
const getSavedCompletedItemsFromLocalStorage = () =>
  JSON.parse(
    window.localStorage.getItem(LOCAL_STORAGE_COMPLETED_ITEMS) ?? "[]"
  );

const savedText = getSavedTextFromLocalStorage();
const savedCompletedItems = getSavedCompletedItemsFromLocalStorage();

const StorageContext = React.createContext({
  onSave: null,
  text: null,
  setText: null,
  completedItems: null,
  setCompletedItems: null,
  isSaved: null,
  setIsSaved: null,
  reloadFromDatabase: null,
  undo: null,
  canUndo: null,
});

export const StorageProvider = ({ children }) => {
  const [destinationFile, setDestinationFile] = React.useState();
  const [data, setData] = React.useState({
    text: savedText,
    completedItems: savedCompletedItems,
  });
  const { text, completedItems } = data;
  const [isSaved, setIsSaved] = React.useState(true);

  const pastDataStates = React.useRef([data]);

  const lastSave = pastDataStates.current[pastDataStates.current.length - 1];
  if (
    lastSave.text !== data.text ||
    lastSave.completedItems !== data.completedItems
  ) {
    pastDataStates.current.push(data);
  }

  const undo = React.useCallback(
    ({ updateText = true } = { updateText: true }) => {
      if (pastDataStates.current.length < 2) return;
      pastDataStates.current.pop();
      if (updateText)
        setData(pastDataStates.current[pastDataStates.current.length - 1]);
    },
    []
  );

  const reloadFromDatabase = React.useCallback(
    () =>
      setData({
        text: getSavedTextFromLocalStorage(),
        completedItems: getSavedCompletedItemsFromLocalStorage(),
      }),
    []
  );

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

  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsSaved(window.localStorage.getItem(LOCAL_STORAGE_TEXT_KEY) === text);
  }, [text]);

  const value = {
    onSave,
    text,
    setText: (functionOrObject) =>
      setData((data) => ({
        ...data,
        text: isFunction(functionOrObject)
          ? functionOrObject(text)
          : functionOrObject,
      })),
    completedItems,
    setCompletedItems: (functionOrObject) =>
      setData((data) => ({
        ...data,
        completedItems: isFunction(functionOrObject)
          ? functionOrObject(data.completedItems)
          : functionOrObject,
      })),
    isSaved,
    setIsSaved,
    reloadFromDatabase,
    undo,
    canUndo: pastDataStates.current.length > 1,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};

const useStorage = () => React.useContext(StorageContext);
export default useStorage;
