import { auth, login, logout } from './actions';
import styles from './page.module.css';

export default async function Home() {
  const subject = await auth();
  const data = await fetch(process.env.NEXT_PUBLIC_API_URL || '');
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ol>
          {subject ? (
            <>
              <li>
                Logged in as <code>{subject.properties.id}</code>.
              </li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          ) : (
            <>
              <li>Login with your email and password.</li>
              <li>
                And then check out <code>app/page.tsx</code>.
              </li>
            </>
          )}
        </ol>
        {await data.text()}
        <div className={styles.ctas}>
          {subject ? (
            <form action={logout}>
              <button className={styles.secondary}>Logout</button>
            </form>
          ) : (
            <form action={login}>
              <button className={styles.primary}>Login with OpenAuth</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
