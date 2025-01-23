import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "./firebaseconfig";

const storage = getStorage(app);

export const uploadFileToFirebaseStorage = async (file, filePath) => {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};