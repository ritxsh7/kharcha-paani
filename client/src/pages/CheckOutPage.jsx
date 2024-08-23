import React from "react";
import Header from "../components/home/Header";
import { useDispatch, useSelector } from "react-redux";
import {
  setSpendingAmount,
  splitAmountEqually,
} from "../store/functions/spending.payload";
import Contributor from "../components/spendings/Contributor";

const CheckOutPage = () => {
  const spendingPayload = useSelector((store) => store.spendingPayload);
  console.log(spendingPayload);

  const dispatch = useDispatch();
  return (
    <div className="p-5 flex flex-col items-center">
      <Header />
      <h2 className="mt-8 text-lg text-[#5c6af5]">Total Amount</h2>
      <div className="flex my-4 flex-col items-center justify-center">
        <span className="text-2xl">₹</span>
        <input
          maxLength="10"
          className="w-[50%] max-w-full h-[3rem] bg-transparent outline-none mx-2 px-2 text-center text-3xl"
          defaultValue={spendingPayload.amount}
          onChange={(e) => {
            dispatch(setSpendingAmount(e.target.value));
            dispatch(splitAmountEqually());
          }}
        ></input>
      </div>
      <div className="my-4 text-lg bg-[#121212] w-[50%] p-4 rounded-md">
        {spendingPayload.description}
      </div>
      {spendingPayload.finalContributors.map((contributor, i) => (
        <Contributor
          key={contributor.friend_name}
          contributor={contributor}
          showInput
          index={i}
        />
      ))}
    </div>
  );
};

export default CheckOutPage;
