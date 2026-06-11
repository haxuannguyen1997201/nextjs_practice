'use client';

import useLogin from '@/src/hooks/useLogin';
import FormField from '@/src/component/FormField';
import SubmitButton from '@/src/component/SubmitButton';


export default function LoginPage() {
  const { action, username, setUsername, password, setPassword, errorMessage, fieldErrors } =
    useLogin();

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="shopTitle loginTitle">Sign in</h1>

        <form className="productForm" action={action} noValidate>
          <div className="formGrid">
            <FormField label="Username" error={fieldErrors?.username?.[0]}>
              <input
                className="formInput"
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </FormField>

            <FormField label="Password" error={fieldErrors?.password?.[0]}>
              <input
                className="formInput"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </FormField>
          </div>

          {errorMessage && <p className="shopStatus shopStatusError">{errorMessage}</p>}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
