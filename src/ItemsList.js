import React from "react";
import { addLinkTags } from "./urls";

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
          <span
            dangerouslySetInnerHTML={{ __html: addLinkTags(render(item)) }}
          />
        </li>
      ))}
    </ul>
  );
};

export default ItemsList;
