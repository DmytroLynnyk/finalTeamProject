// import css from './WaterForm.module.css';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  waterAmount: Yup.number().required('Water amount is required').positive('Water amount must be positive'),
  time: Yup.string().required('Time is required').matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
});


const WaterForm = () => {
  // const getCurrentTime = () => {
  //   const now = new Date();
  //   const hour = now.getHours().toString().padStart(2, '0');
  //   const minute = now.getMinutes().toString().padStart(2, '0');
  //   return `${hour}:${minute}`;
  // };
  
  // const { register, handleSubmit, errors, setValue, watch } = useForm({
  //   defaultValues: { waterAmount: 50, time: getCurrentTime() },
  //   validationSchema: schema,
  // });

  

  // const submitForm = async (data) => {
  //   try {
  //     await onSubmit(data);
  //   } catch (error) {
  //     // Handle backend error, display notification to user
  //     console.error('Error:', error);
  //   }
  // };

  // const handleIncrement = () => {
  //   const currentValue = parseInt(watch('waterAmount'));
  //   setValue('waterAmount', currentValue + 1);
  // };

  // const handleDecrement = () => {
  //   const currentValue = parseInt(watch('waterAmount'));
  //   if (currentValue > 0) {
  //     setValue('waterAmount', currentValue - 1);
  //   }
  // };

  return (
    <form >
      <div>
        <label htmlFor="waterAmount">Amount of water:</label>
        <div>
          <button type="button" >-</button>
          <input type="number" name="waterAmount"  />
          <button type="button" >+</button>
        </div>
        
      </div>
      <div>
        <label htmlFor="time">Recording time:</label>
        <input type="text" name="time"  />
       
      </div>
      <div>
        <label htmlFor="water">Enter the value of water used:</label>
        <input type="text" name="time"  />
  
      </div>
      <div>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

export default WaterForm;
