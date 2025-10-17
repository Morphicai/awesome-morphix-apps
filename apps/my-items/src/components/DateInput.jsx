import React from 'react';
import styles from './DateInput.module.css';

const DateInput = ({ value, onChange, ...props }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className={styles.dateInput}
      {...props}
    />
  );
};

export default DateInput;