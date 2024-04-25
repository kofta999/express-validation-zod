import { urlencoded } from "body-parser";
import express, { type RequestHandler } from "express";
import { ZodError, z } from "zod";

const app = express();
const PORT = process.env.PORT ?? 3000;

const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(1)
      .refine((v) => !/\d/.test(v), "Full name cannot contain numbers"),

    email: z
      .string()
      .email("Email should be valid")
      .refine(
        (v) => v.endsWith("@gmail.com"),
        "Email should end in @gmail.com"
      ),

    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password should have at least one uppercase letter, one lowercase letter, one number, and one special character and a min of 8 characters"
      ),

    confirmPassword: z.string(),

    birthDate: z.string().date("Invalid date"),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords does not match",
    path: ["confirmPassword"],
  });

const zodValidator: RequestHandler = (req, res, next) => {
  try {
    const parsed = registerFormSchema.parse(req.body);
    next();
  } catch (error) {
    const errors = (error as ZodError).flatten().fieldErrors;
    console.log(errors);
    res.render("register", { errors, success: false });
  }
};

app.use(urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
  res.render("register", { errors: null, success: false });
});

app.post("/", zodValidator, (req, res, next) => {
  const body = req.body;
  if (body) {
    res.render("register", { errors: null, success: true });
  }
});

app.listen(PORT);
console.log("Connected on port " + PORT);
