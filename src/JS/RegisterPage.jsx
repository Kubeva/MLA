import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRep, setPasswordRep] = useState("");
  const navigate = useNavigate();

  const registerAttempt = async () => {
    const isValid = validateRegistration();

    if (!isValid) {
      return;
    }
    try {
      const res = await fetch("https://localhost/users/register/", {
      method: "POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify({username, password})
      });

      if(!res.ok){
      throw new Error("Registration failed.");
      }

      console.log("Registration successful.");
      setUsername("");
      setPassword("");
      setPasswordRep("");
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  const validateRegistration = () => {
    if (username.length === 0) {
      alert("Username jest puste!");
      return false;
    }

    if (password.length === 0 || passwordRep.length === 0) {
      alert("Password jest puste!");
      return false;
    }
    
    if (password.localeCompare(passwordRep) !== 0) {
      alert("Hasła nie są takie same!");
      return false;
    }

    return true;
  };

  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      };

      try {
        const res = await fetch("https://localhost/users/me/", {
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
          <Form.Group>
            <Form.Label>Powtórz hasło</Form.Label>
            <Form.Control 
              type="password" 
              value={passwordRep}
              onChange={(e) => setPasswordRep(e.target.value)}
            />
          </Form.Group>
        </Form>
        <Button className="mla-button" onClick={registerAttempt}>Register</Button>
      </div>
    </>
  );
}

export default RegisterPage;