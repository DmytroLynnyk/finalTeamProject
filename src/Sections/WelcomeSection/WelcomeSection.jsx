import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import css from './WelcomeSection.module.css';

export default function WelcomeSection() {
  return (
    <section className={css.section}>
      <div className={css.container}>
        <Logo />
        <div className={css.hero}>
          <h3 className={css.subtitle}>Record daily water intake and track</h3>
          <h1 className={css.title}>Water consumption tracker</h1>
          <div className={css.link}>
            <Link to="/signup" className={css.try}>
              Try tracker
            </Link>
            <Link to="/signin" className={css.sign}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}