import React from "react";
import { RiUserSearchFill } from "react-icons/ri";
import { spendingStyles } from "./styles";

const SearchBar = ({ onFocus, handleSearch }) => {
  return (
    <>
      <p className={spendingStyles.searchBar.label}>Add contributors</p>
      <div className={spendingStyles.searchBar.container}>
        <span className={spendingStyles.searchBar.icon}>
          <RiUserSearchFill />
        </span>
        <input
          onChange={handleSearch}
          onFocus={() => onFocus(true)}
          onBlur={(e) =>
            setTimeout(() => {
              onFocus(false);
            }, 100)
          }
          type="text"
          placeholder="eg. Sanket"
          className={`${spendingStyles.form.input.field} outline-none pl-10`}
        ></input>
      </div>
    </>
  );
};

export default SearchBar;
