import React, { useEffect, useState, useRef, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../redux/auth/selectors';
import { updateUserSettings } from '../../redux/auth/operations';
import getBmiResult from '../../components/utils/getBmiResult ';
import getColorClass from '../../components/utils/getColorClassForBmi';
import Loader from '../../components/Loader/Loader';
import IconSprite from '../../image/sprite.svg';
import css from './UserSettingsForm.module.css';

import ThemeSwitcher from 'Theme/ThemeSwitcher/ThemeSwitcher';
import { ThemeContext } from '../../Theme/ThemeContext';
import { useTranslation } from 'react-i18next';

const schema = yup.object().shape({
  avatar: yup.mixed(),
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['male', 'female'], 'Gender must be either male or female'),
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(20, 'Name must be at most 20 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  weight: yup
    .number()
    .required('Weight is required')
    .min(0, 'Weight must be a positive number'),
  height: yup
    .number()
    .required('Height is required')
    .min(50, 'Height must be greater than or equal to 50')
    .max(260, 'Height must be a realistic number'),
  activeTime: yup
    .number()
    .required('Sport time is required')
    .min(0, 'Active time must be a positive number')
    .max(24, 'Active time must be a realistic number')
    .positive('Active time must be a positive number'),
  goal: yup
    .number()
    .required('Water intake is required')
    .min(0, 'Water intake must be a positive number')
    .positive('Water intake must be a positive number'),
});

const UserSettingsForm = ({ closeModal }) => {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUser);

  const [avatarUrl, setAvatarUrl] = useState(userInfo.avatarUrl);
  const [userInfoUpdated, setUserInfoUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [isFileValid, setIsFileValid] = useState(true);
  const [emailChanged, setEmailChanged] = useState(false);
  const [dailyNorma, setDailyNorma] = useState('');
  const avatarInputRef = useRef(null);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      avatar: '',
      gender: '',
      name: '',
      email: '',
      weight: 0,
      height: 0,
      bmi: 0,
      activeTime: 0,
      goal: 0,
    },
  });

  useEffect(() => {
    if (userInfo && userInfo.email && !userInfoUpdated) {
      const { email, name, gender, weight, height, bmi, activeTime, goal } =
        userInfo;
      setValue('email', email);
      setValue('name', name || email.split('@')[0]);
      setValue('gender', gender || '');
      setValue('weight', weight || 0);
      setValue('height', height || 0);
      setValue('bmi', bmi || 0);
      setValue('activeTime', activeTime || 0);
      setValue('goal', goal ? goal / 1000 : 0);
      setUserInfoUpdated(true);
    }
  }, [userInfo, setValue, userInfoUpdated]);

  const gender = watch('gender');
  const weight = watch('weight');
  const activeTime = watch('activeTime');
  const email = watch('email');
  const bmi = watch('bmi');

  useEffect(() => {
    if (gender && weight && activeTime) {
      const calculatedDailyNorma =
        gender === 'female'
          ? weight * 0.03 + activeTime * 0.4
          : weight * 0.04 + activeTime * 0.6;
      setDailyNorma(parseFloat(calculatedDailyNorma.toFixed(1)));
    }
  }, [gender, weight, activeTime]);

  useEffect(() => {
    if (email !== userInfo.email) {
      setEmailChanged(true);
    } else {
      setEmailChanged(false);
    }
  }, [email, userInfo.email]);

  const handleAvatarChange = event => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 7 * 1024 * 1024) {
        setAvatarError('File size exceeds 7MB');
        setAvatarUrl(userInfo.avatarUrl);
        setIsFileValid(false);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatarUrl(reader.result);
        };
        reader.readAsDataURL(file);
        setAvatarError('');
        setIsFileValid(true);
      }
    }
  };

  const recalculateGoal = e => {
    const genderValue = watch('gender');
    const weightValue =
      e.target.name === 'weight' ? parseFloat(e.target.value) : watch('weight');
    const activeTimeValue =
      e.target.name === 'activeTime'
        ? parseFloat(e.target.value)
        : watch('activeTime');
    if (genderValue && weightValue && activeTimeValue) {
      const setDailyNorma =
        genderValue === 'female'
          ? weightValue * 0.03 + activeTimeValue * 0.4
          : weightValue * 0.04 + activeTimeValue * 0.6;
      setDailyNorma(parseFloat(setDailyNorma.toFixed(1)));
    }
  };

  const onSubmit = async (data, e) => {
    console.log(data);
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    const file = avatarInputRef.current.files[0];
    if (file) {
      if (file.size > 7 * 1024 * 1024) {
        setAvatarError('File size exceeds 7MB');
        setLoading(false);
        return;
      } else {
        formData.append('avatar', file);
      }
    }

    formData.append('gender', data.gender);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('weight', data.weight);
    formData.append('height', data.height);
    formData.append('activeTime', data.activeTime);
    formData.append('goal', data.goal * 1000);

    try {
      dispatch(updateUserSettings(formData));
      closeModal();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAvatarUrl(userInfo.avatarUrl);
  }, [userInfo.avatarUrl]);

  const bmiColorClass = getColorClass(parseFloat(bmi));

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={css.form}
        action="/profile"
        method="put"
        encType="multipart/form-data"
      >
        <div className={`${css.formGroup} ${css.avatarContainer}`}>
          <div className={css.thumb}>
            <img src={avatarUrl} alt="User avatar" className={css.avatar} />
          </div>
          <label
            htmlFor="uploadInput"
            className={`${css.uploadLabel} ${css.uploadText}`}
            tabIndex={0}
          >
            <svg className={css.icon}>
              <use href={`${IconSprite}#IconUpload`}></use>
            </svg>
            {t('settingsForm.uploadPhoto')}
            <input
              id="uploadInput"
              type="file"
              {...register('avatar')}
              className={css.avatarInput}
              accept="image/*, .png, .jpg, .jpeg"
              onChange={handleAvatarChange}
              ref={avatarInputRef}
              autoComplete="photo"
            />
          </label>
          {avatarError && (
            <span className={`${css.error} ${css.avatarError} `}>
              {avatarError}
            </span>
          )}
        </div>
        <div className={css.formWraper}>
          <div className={css.formWrap_1}>
            <div className={css.formGroup}>
              <label htmlFor="female" className={css.accentLabel}>
                {t('settingsForm.yourGender')}
              </label>
              <div className={css.genderInput}>
                <input
                  type="radio"
                  id="female"
                  value="female"
                  {...register('gender')}
                  autoComplete="gender"
                  onInput={recalculateGoal}
                />
                <label
                  htmlFor="female"
                  className={css.genderLabel}
                  tabIndex="0"
                >
                  {t('settingsForm.woman')}
                </label>
                <input
                  type="radio"
                  id="male"
                  value="male"
                  {...register('gender')}
                  autoComplete="gender"
                  onInput={recalculateGoal}
                />
                <label htmlFor="male" className={css.genderLabel} tabIndex="0">
                  {t('settingsForm.man')}
                </label>
                {errors.gender && (
                  <span className={css.error}>{errors.gender.message}</span>
                )}
              </div>
            </div>
            <div className={`${css.formGroup} ${css.nameInput}`}>
              <label htmlFor="name" className={css.accentLabel}>
                {t('settingsForm.yourName')}
              </label>
              <input
                type="text"
                {...register('name')}
                className={css.input}
                id="name"
                autoComplete="name"
              />
              {errors.name && (
                <span className={`${css.nameError} ${css.error}`}>
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className={`${css.formGroup} ${css.emailInput}`}>
              <label htmlFor="email" className={css.accentLabel}>
                {t('auth_form.email')}
              </label>
              <input
                type="text"
                {...register('email')}
                className={css.input}
                id="email"
                autoComplete="email"
              />
              {errors.email && (
                <span className={`${css.emailError} ${css.error}`}>
                  {errors.email.message}
                </span>
              )}
              {emailChanged && (
                <span className={css.emailChanged}>
                  If you fill in an incorrect or non-existent email, you may
                  lose access to your AquaTrack account during the password
                  recovery procedure.
                </span>
              )}
            </div>
            <div className={css.formGroup}>
              <p className={css.infoTitle}>
                {t('waterDailyNorma.dailyNorma')}
              </p>
              <ul className={css.list}>
                <li className={css.listItem}>
                  <p className={css.listItemText}>
                    {t('settingsForm.forWoman')}
                  </p>
                  <p className={css.listItemNorma}>V=(M*0,03) + (T*0,4)</p>
                </li>
                <li className={css.listItem}>
                  <p className={css.listItemText}>
                    {t('settingsForm.forMan')}:
                  </p>
                  <p className={css.listItemNorma}>V=(M*0,04) + (T*0,6)</p>
                </li>
              </ul>
              <p className={css.calculation}>
                <span className={css.calcIcon}>*</span>
                {t('settingsForm.calc')}
              </p>
              <p className={css.info}>
                <svg className={css.iconInfo}>
                  <use href={`${IconSprite}#Attention`}></use>
                </svg>
                {t('settingsForm.activeTime')}
              </p>
            </div>
          </div>
          <div className={css.formWrap_2}>
            <div className={`${css.formGroup} ${css.weightInput}`}>
              <label htmlFor="weight" className={css.label}>
                {t('settingsForm.yourWeight')}:
              </label>
              <input
                type="number"
                min="0"
                id="weight"
                {...register('weight')}
                className={css.input}
                autoComplete="weight"
                onInput={recalculateGoal}
              />
              {errors.weight && errors.weight.type === 'typeError' ? (
                <span className={`${css.weightError} ${css.error}`}>
                  {t('settingsForm.weightRequired')}
                </span>
              ) : (
                <span className={`${css.weightError} ${css.error}`}>
                  {errors.weight?.message}
                </span>
              )}
            </div>
            <div className={`${css.formGroup} ${css.heightInput}`}>
              <label htmlFor="height" className={css.label}>
                {t('settingsForm.yourHeight')}:
              </label>
              <input
                type="number"
                min="50"
                max="260"
                id="height"
                {...register('height')}
                className={css.input}
                autoComplete="height"
              />
              {errors.height && errors.height.type === 'typeError' ? (
                <span className={`${css.heightError} ${css.error}`}>
                  {t('settingsForm.heightRequired')}
                </span>
              ) : (
                <span className={`${css.heightError} ${css.error}`}>
                  {errors.height?.message}
                </span>
              )}
            </div>
            <div className={`${css.formGroup} ${css.activeTimeInput}`}>
              <label htmlFor="activeTime" className={css.label}>
                {t('settingsForm.activeParticipation')}:
              </label>
              <input
                type="number"
                min="0"
                id="activeTime"
                {...register('activeTime')}
                className={css.input}
                autoComplete="active-time"
                onInput={recalculateGoal}
              />
              {errors.activeTime && errors.activeTime.type === 'typeError' ? (
                <span className={`${css.activeTimeError} ${css.error}`}>
                  {t('settingsForm.activeTimeRequired')}
                </span>
              ) : (
                <span className={`${css.activeTimeError} ${css.error}`}>
                  {errors.activeTime?.message}
                </span>
              )}
            </div>
            <div className={css.formGroup}>
              <p className={css.dailyNorma}>
                {t('settingsForm.requiredAmount')}:
                <span className={css.dailyNormaValue}>
                  {dailyNorma ? `${dailyNorma} L` : ''}
                </span>
              </p>
            </div>
            <div className={`${css.formGroup} ${css.goalInput}`}>
              <label htmlFor="goal" className={css.accentLabel}>
                {t('settingsForm.writeWateDrink')}:
              </label>
              <input
                type="number"
                id="goal"
                {...register('goal')}
                className={css.input}
                min="0"
                step="0.1"
                value={watch('goal')}
                autoComplete="goal"
              />
              {errors.goal && !watch('goal') && (
                <span className={`${css.goalError} ${css.error}`}>
                  {t('settingsForm.goalRequired')}
                </span>
              )}
            </div>
            <div className={css.formGroup}>
              <p className={css.bmiIndex}>
                {t('settingsForm.yourBodyMassIndex')}:
                <span className={`${css.bmiIndexValue} ${css[bmiColorClass]}`}>
                  {watch('bmi')
                    ? `${watch('bmi')} (${getBmiResult(watch('bmi'))})`
                    : ''}
                </span>
              </p>
            </div>
            <div className={css.themeSwitcherBox}>
              <ThemeSwitcher />
              <p className={css.settingsTheme}>
                    {t('settingsForm.currentTheme')}:{useContext(ThemeContext).theme}
              </p>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className={css.submitBtn}
          disabled={loading || !isFileValid}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {loading && <Loader />}
      </form>
    </>
  );
};

export default UserSettingsForm;
