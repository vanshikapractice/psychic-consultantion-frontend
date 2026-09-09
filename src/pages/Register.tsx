import { RegisterForm } from "../components/auth";
import { Card } from "../components/ui";

export function Register() {
  return (
    <div className="page page--auth">
      <Card>
        <RegisterForm />
      </Card>
    </div>
  );
}
