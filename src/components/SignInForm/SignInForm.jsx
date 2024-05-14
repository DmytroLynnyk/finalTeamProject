import css from './SignInForm.module.css';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signin } from '../../redux/auth/operations';
import { Link } from 'react-router-dom';
import Image from '../../image/sprite.svg';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Must be valid email!').required('Required'),
  password: Yup.string().min(7, 'Too Short!').required('Required'),
});

export default function SignInForm() {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const emailFieldId = useId();
  const passwordFieldId = useId();

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const onSubmit = data => {
    dispatch(signin(data));
    reset();
  };

  return (
    <div className={css.divWrap}>
      <h1 className={css.title}>Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={css.form}>
        <label htmlFor={emailFieldId} className={css.label}>
          Email
        </label>
        <div className={css.errorContainer}>
          <input
            {...register('email')}
            className={`${css.input} ${errors.email && css.errorInput}`}
            id={emailFieldId}
            placeholder="Enter your email"
          />
          {errors.email && (
            <span className={css.error}>{errors.email.message}</span>
          )}
        </div>

        <label htmlFor={passwordFieldId} className={css.label}>
          Password
        </label>
        <div className={css.errorContainer}>
          <input
            {...register('password')}
            autoComplete="off"
            className={`${css.input} ${errors.password && css.errorInput}`}
            id={passwordFieldId}
            placeholder="Enter your password"
            type="text"
          />
          {errors.password && (
            <span className={css.error}>{errors.password.message}</span>
          )}

          {window.innerWidth > 768 && (
            <button
              type="button"
              className={css.eyeBtn}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg className={`${css.eyeIcon}`} width="18" height="18">
                  <use href={`${Image}#IconEye-off`} />
                </svg>
              ) : (
                <svg className={css.eyeIcon} width="18" height="18">
                  <use href={`${Image}#IconEye`} />
                </svg>
              )}
            </button>
          )}
        </div>

        <button type="submit" className={css.button}>
          Sign In
        </button>
      </form>
      <p className={css.text}>
        Don't have any account?{' '}
        <Link to="/signup" className={css.link}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}
