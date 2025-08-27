import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Typography, Box, Paper, Divider, Button } from "@mui/material";
import { useEffect } from "react";

type Customer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    status?: string;
};

type Props = {
    customer: Customer | null;
};

export default function CustomerDetail({ customer }: Props) {

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/signin");
        }
    }, [router]);


    if (!customer) {
        return <Typography variant="h6">Customer not found</Typography>;
    }

    const DRAFT_KEY = "onboardingDraft";

    return (
        <Box sx={{ maxWidth: 600, margin: "2rem auto" }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Customer Profile
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography>
                    <strong>ID:</strong> {customer.id}
                </Typography>
                <Typography>
                    <strong>Name:</strong> {customer.firstName + customer.lastName}
                </Typography>
                <Typography>
                    <strong>Email:</strong> {customer.email}
                </Typography>
                <Typography>
                    <strong>Phone:</strong> {customer.phone}
                </Typography>
                <Typography>
                    <strong>Date of Birth:</strong> {customer.dob}
                </Typography>
                <Typography>
                    <strong>Status:</strong> {customer.status ?? "Draft"}
                </Typography>

                <Box sx={{ mt: 3, display: "flex" }} gap={2}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            localStorage.setItem(DRAFT_KEY, JSON.stringify(customer));
                            router.push(`/`);
                        }}
                    >
                        Edit Draft
                    </Button>
                    <Button variant="outlined" color="error" onClick={async () => {
                            const res = await fetch(`/api/items?id=${customer.id}`, {
                                method: "DELETE",
                            });
                            if (res.ok) {
                                router.push(`/`);
                            } else {
                                console.error("Failed to delete customer");
                            }
                    }}>
                        Delete
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

// Fetch customer by ID from API route or JSON
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string };

    // call your mock API route
    const res = await fetch("http://localhost:3000/api/items");
    const data = await res.json();
    let customer: Customer | null = null;

    if (res.ok) {
        customer = data.find((c: Customer) => c.id === id) || null;
    }

    return {
        props: {
            customer,
        },
    };
};
