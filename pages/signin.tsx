import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    // If already signed in, redirect
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Save mocked token in localStorage
    localStorage.setItem("token", "mock-session-token");
    localStorage.setItem("userEmail", email);

    // Redirect to homepage (or /onboarding)
    router.push("/");
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 8, mt: 8, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignInPage;