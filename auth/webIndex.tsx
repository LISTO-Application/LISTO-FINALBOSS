import { app, authWeb } from "@/app/(auth)";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export async function authenticateWeb(email: string, password: string) {
  console.log("Attempting to login");
  const auth = getAuth(app);

  try {
    console.log("Email:", email, "Password:", password);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log(result);
    if (result.user) {
      console.log("Logged in successfully");
      return { success: true };
    }
  } catch (error: any) {
    // Handle different error cases
    switch (error.code) {
      case "auth/too-many-requests":
        alert(
          "Too many requests. Too many subsequent login attempts, please try again in a few seconds!"
        );
        break;
      case "auth/invalid-email":
        alert("Invalid email. Please enter a valid email address.");
        break;
      case "auth/wrong-password":
        alert("Invalid password. The password is incorrect.");
        break;
      case "auth/user-not-found":
        alert("Incorrect credentials. The email or password is incorrect.");
        break;
      case "auth/network-request-failed":
        alert("Poor connection. Network unstable, please try again later.");
        break;
      case "firestore/permission-denied":
        alert(
          "Permission denied. Registration failed. Please try again later."
        );
        break;
      case "auth/invalid-credential":
        alert("Incorrect credentials. The email or password is incorrect.");
        break;
      default:
        console.error("Authentication error:", error);
        alert("Login failed. An unexpected error occurred.");
    }
    return { success: false };
  }
}
