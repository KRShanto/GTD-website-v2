// Export Firebase configuration
export { default as app, storage, auth, db } from "./config";

// Export Firebase storage utilities
export {
  uploadImageToFirebase,
  deleteImageFromFirebase,
  uploadVideoToFirebase,
  deleteVideoFromFirebase,
  extractFirebasePathFromUrl,
  type FirebaseUploadResult,
} from "./storage";
