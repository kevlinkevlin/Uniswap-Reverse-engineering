import React from "react";

import Card from "../UI/Card/Card";
import classes from "./SwapBUSD.module.css";
import Button from "../UI/Button/Button";

const SwapBUSD = (props) => {
  const submitHandler = (event) => {
    event.preventDefault();
    props.onSwap();
  };

  const onTokenEntered = (event) => {
    const value = event.target.value;
    props.onTokenEntered(value);
  };

  return (
    <Card className={classes.swap}>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <input type="number" step=".0001" onChange={onTokenEntered} />
        </div>
        <div className={classes.actions}>
          <Button type="submit" className={classes.btn}>
          BUSD => ETH
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SwapBUSD;
