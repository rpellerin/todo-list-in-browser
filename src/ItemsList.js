import React from "react";

const ItemsList = ({ items, onCheckboxCheck, checked, render, ...props }) => {
  if (items.length === 0) return <div>Empty</div>;
  return (
    <ul {...props}>
      {items.map((item, index) => (
        <li key={item.index || index}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onCheckboxCheck(item, index)}
          />{" "}
          {render(item)}
        </li>
      ))}
    </ul>
  );
};

export default ItemsList;
