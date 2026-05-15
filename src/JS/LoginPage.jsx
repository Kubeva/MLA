import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Link, useNavigate  } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginAttempt = async () => {
    try {
      const res = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if(!res.ok){
        throw new Error("Login failed.");
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);

      console.log("Login successful.");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      };

      try {
        const res = await fetch("http://localhost:4000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          navigate("/");
        } else {
          localStorage.removeItem("token");
        }
      } catch(err) {
        console.log(err);
      }
    };
    checkAuth();
  }, [navigate]);

  return (
  <>
    <div className="mla-user-box">
      <Form>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Hasło</Form.Label>
          <Form.Control 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
      </Form>
      <Button className="mla-button" onClick={loginAttempt}>Login</Button>
      <Button className="mla-button" as={Link} to="/register">Register</Button>
    </div>
  </>
  );
}

export default LoginPage;