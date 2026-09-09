import { LoginForm } from "../components/auth";
import { Card } from "../components/ui";

export function Login() {
  return (
    <div className="page page--auth">
      <Card>
        <LoginForm />
      </Card>
    </div>
  );
}
