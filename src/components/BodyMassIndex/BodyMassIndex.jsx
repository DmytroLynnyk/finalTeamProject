import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { GrPowerReset } from 'react-icons/gr';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../redux/auth/selectors';
import { updateUserSettings } from '../../redux/auth/operations';
import BMIImage from '../../image/BMI.png';
import Loader from '../../components/Loader/Loader';
import getBmiResult from 'components/utils/getBmiResult ';
import getColorClass from 'components/utils/getColorClassForBmi';
import css from './BodyMassIndex.module.css';

const schema = yup.object().shape({
  weight: yup
    .number()
    .required('Weight is required')
    .min(0, 'Weight must be a positive number'),
  height: yup
    .number()
    .required('Height is required')
    .min(0, 'Height must be a positive number')
    .max(300, 'Height must be a realistic number'),
});

export default function BodyMassIndex() {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUser);
  const [bmiValue, setBmiValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      weight: 0,
      height: 0,
    },
  });

  useEffect(() => {
    if (userInfo) {
      const { weight, height } = userInfo;
      setValue('weight', weight || 0);
      setValue('height', height || 0);
    }
  }, [userInfo, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    const { weight, height } = data;

    if (!weight || !height) {
      setDataError('Please enter both weight and height.');
      setLoading(false);
      return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    setBmiValue(bmi.toFixed(1));
    setDataError('');

    const formData = new FormData();
    formData.append('bmi', bmi.toFixed(1));

    try {
      // console.log(bmi.toFixed(1));
      dispatch(updateUserSettings(formData));
    } catch (error) {
      console.error('Failed to update user settings', error);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    reset();
    setBmiValue(null);
    setDataError('');
  };

  const handleInputChange = () => {
    if (dataError) {
      setDataError('');
    }
  };

  const bmiColorClass = getColorClass(parseFloat(bmiValue));

  return (
    <div className={css.wrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
        <p className={css.text}>
          Body mass index (BMI) is a calculated value that allows you to assess
          the degree of correspondence between a person's body weight and
          height. Such a ratio gives us information about whether the weight is
          normal, insufficient or excessive. The BMI indicator reflects the fat
          reserves in the human body, which can timely signal its excess, the
          risk of developing obesity and related diseases. Enter your data below
          to calculate your BMI.
        </p>
        <div className={css.formElements}>
          <div className={css.labels}>
            <div className={`${css.formGroup} ${css.weightInput}`}>
              <label htmlFor="weight" className={css.label}>
                Weight (kg):
              </label>
              <input
                type="number"
                min="0"
                id="weight"
                {...register('weight')}
                className={css.input}
                autoComplete="weight"
                onInput={handleInputChange}
              />
              {errors.weight && errors.weight.type === 'typeError' ? (
                <span className={`${css.weightError} ${css.error}`}>
                  Weight is required
                </span>
              ) : (
                <span className={`${css.weightError} ${css.error}`}>
                  {errors.weight?.message}
                </span>
              )}
            </div>
            <div className={`${css.formGroup} ${css.heightInput}`}>
              <label htmlFor="height" className={css.label}>
                Height (cm):
              </label>
              <input
                type="number"
                min="0"
                max="300"
                id="height"
                {...register('height')}
                className={css.input}
                autoComplete="height"
                onInput={handleInputChange}
              />
              {errors.height && errors.height.type === 'typeError' ? (
                <span className={`${css.heightError} ${css.error}`}>
                  Height is required
                </span>
              ) : (
                <span className={`${css.heightError} ${css.error}`}>
                  {errors.height?.message}
                </span>
              )}
            </div>
          </div>
          <div className={css.buttons}>
            <button type="submit" className={css.btn} disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate BMI'}
            </button>
            <button
              type="button"
              className={`${css.btn} ${css.resetBtn}`}
              onClick={onReset}
              disabled={loading}
            >
              <GrPowerReset className={css.resetIcon} />
            </button>
          </div>
          {dataError && (
            <span className={`${css.error} ${css.errorData}`}>{dataError}</span>
          )}
        </div>
        {bmiValue && (
          <div className={css.result}>
            <div className={css.thumb}>
              <img src={BMIImage} alt="Body mass index" className={css.image} />
            </div>
            <p className={`${css.value} ${css[bmiColorClass]}`}>{bmiValue}</p>
            {bmiValue !== null && (
              <p className={`${css.indexMessage} ${css[bmiColorClass]}`}>
                {bmiValue} - {getBmiResult(bmiValue)}
              </p>
            )}
          </div>
        )}
        {loading && <Loader />}
      </form>
    </div>
  );
}
