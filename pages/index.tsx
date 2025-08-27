import Head from "next/head";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, TablePagination, Box, CircularProgress
} from "@mui/material";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { z } from "zod";
import { useRouter } from "next/router";


const steps = ["Email", "Personal Info", "Review & Submit"];

const emailSchema = z.object({
  email: z.email("Invalid email"),
});

const personalSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  dob: z
    .string()
    .refine(
      (date) => {
        const d = new Date(date);
        const age = new Date().getFullYear() - d.getFullYear();
        return age >= 18;
      },
      { message: "Must be at least 18 years old" }
    ),
});

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  id: string;
  status?: string;
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function Home() {

  const [rows, setRows] = useState<FormData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const [signInEmail, setSignInEmail] = useState("User");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  const isMobile = useMediaQuery("(max-width:600px)");


  useEffect(() => {
    setSignInEmail(localStorage.getItem("userEmail") || "User");

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
    }
  }, [router]);


  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Failed to fetch items", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  const filteredRows = rows?.filter(
    (row) =>
      row.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      row.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      String(row.phone).includes(searchText) ||
      String(row.dob).includes(searchText)
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    id: Date.now().toString(),
    status: "draft",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    let validationErrors: Record<string, string> = {};
    if (activeStep === 0) {
      const result = emailSchema.safeParse({ email: formData.email });
      if (!result.success) {
        validationErrors = { email: result.error.message };
      }
    }
    if (activeStep === 1) {
      const result = personalSchema.safeParse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob,
      });
      if (!result.success) {
        result.error.issues.forEach((err) => {
          const field = String(err.path[0]);
          validationErrors[field] = err.message;
        });
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={2} width="300px">
            <input
              type="hidden"
              name="id"
              value={formData.id}
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
        );
      case 1:
        return (
          <Box display="flex" flexDirection="column" gap={2} width="300px">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              error={!!errors.dob}
              helperText={errors.dob}
            />
          </Box>
        );
      case 2:
        return (
          <Paper elevation={2} sx={{ p: 3, width: "300px" }}>
            <Typography variant="h6">Review your information</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>
              Name: {formData.firstName} {formData.lastName}
            </Typography>
            <Typography>Phone: {formData.phone}</Typography>
            <Typography>DOB: {formData.dob}</Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const updatedFormData = { ...formData, status: "onboarded" }
      const response = await fetch("/api/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to save customer");
      }

      const result = await response.json();
      const res = await fetch("/api/items");
      const data = await res.json();
      setRows(data);
      localStorage.removeItem(DRAFT_KEY); // clear draft after submission
      setActiveStep(0);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        dob: "",
        id: Date.now().toString(),
        status: "draft",
      });
    } catch (err) {
    }
  };

  const DRAFT_KEY = "onboardingDraft";
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  }, []);

  const handleSaveDraft = async () => {
    try {
      const updatedFormData = { ...formData, status: "draft" }
      const response = await fetch("/api/items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to save customer");
      }

      const result = await response.json();
      const res = await fetch("/api/items");
      const data = await res.json();
      setRows(data);

    } catch (err) {
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    alert("Draft saved!");
  };

  const handleRowClick = (id: string) => {
    router.push(`/customers/${id}`); // navigate to a detail page
  }


  return (
    <>
      <Head>
        <title>customer onboarding</title>
        <meta name="description" content="Customer onboarding application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <Typography variant="h3">Customer Onboarding</Typography>
          <Typography variant="h6">Welcome {signInEmail}</Typography>

          <Box sx={{ width: "100%", mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box sx={{ mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 2 }}>
                  Back
                </Button>
              )}
              <Button onClick={handleSaveDraft} sx={{ mr: 2 }}>Save as Draft</Button>

              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleReviewSubmit}>
                  Submit
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            {/* 🔍 Search bar */}
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 2 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              isMobile ? (
                <div>
                  {rows.map((row, i) => (
                    <Paper key={i} sx={{ p: 2, mb: 2 }}>
                      <div onClick={() => handleRowClick(row.id)}><b>Email:</b> {row.email}</div>
                      <div onClick={() => handleRowClick(row.id)}><b>First Name:</b> {row.firstName}</div>
                      <div onClick={() => handleRowClick(row.id)}><b>Last Name:</b> {row.lastName}</div>
                      <div onClick={() => handleRowClick(row.id)}><b>Phone:</b> {row.phone}</div>
                      <div onClick={() => handleRowClick(row.id)}><b>Date of Birth:</b> {row.dob}</div>
                      <div onClick={() => handleRowClick(row.id)}><b>Status:</b> {row.status}</div>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Paper>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>First Name</TableCell>
                          <TableCell>Last Name</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Date of Birth</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRows
                          ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row) => (
                            <TableRow key={row.id} hover
                              sx={{ cursor: "pointer" }}
                              onClick={() => handleRowClick(row.id)}>
                              <TableCell>{row.email}</TableCell>
                              <TableCell>{row.firstName}</TableCell>
                              <TableCell>{row.lastName}</TableCell>
                              <TableCell>{row.phone}</TableCell>
                              <TableCell>{row.dob}</TableCell>
                              <TableCell>{row.status}</TableCell>
                            </TableRow>
                          ))}
                        {filteredRows?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No results found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows?.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              )
            )}
        </Box>
      </main>
    </div >
    </>
  );
}
