import Link from 'next/link';
import styles from './header.module.scss';

interface HeaderProps {
  ActivePost?: boolean;
}

export default function Header({ ActivePost }: HeaderProps): JSX.Element {
  return (
    <header
      className={`${styles.content} ${ActivePost ? styles.activePost : ''}`}
    >
      <div>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
