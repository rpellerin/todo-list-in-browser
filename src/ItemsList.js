import React from "react";

const ItemsList = ({ items, onCheckboxCheck, checked, ...props }) => {
  if (items.length === 0) return <div>Empty</div>;
  return (
    <ul {...props}>
      {items
        .filter(({ item }) => item.length > 0)
        .map(({ item, rawItem, index }) => (
          <li>
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onCheckboxCheck({
                  item,
                  rawItem,
                  index,
                })
              }
            />{" "}
            {item}
          </li>
        ))}
    </ul>
  );
};

export default ItemsList;
