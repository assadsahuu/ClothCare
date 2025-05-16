import { Alert, Button, TextInput, Modal, Label } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailed } from '../redux/user/userSlice';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db, storage } from '../firebase';

function DashProfile() {
  const currentUser = useSelector(state => state.user.currentUser);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(currentUser?.image || "");
  const [formData, setFormData] = useState({});
  const [imageUploadError, setImageUploadError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (currentUser?.providerData) {
      const providers = currentUser.providerData.map(provider => provider.providerId);

      // Check if Google is a provider
      const isGoogle = providers.includes("google.com");
      // Check if Password is also a provider
      const hasPassword = providers.includes("password");

      // Set isGoogleUser to true only if Google is the sole provider
      setIsGoogleUser(isGoogle && !hasPassword);
    }
  }, [currentUser]);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  // Upload Image to Firebase Storage
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageUploadError(null);
    if (!imageFile) return;

    try {
      const fileName = `profile_images/${currentUser.uid}_${Date.now()}`;
      const imgRef = storageRef(storage, fileName);
      const uploadTask = uploadBytesResumable(imgRef, imageFile);

      uploadTask.on(
        "state_changed",
        null,
        (error) => setImageUploadError("Upload failed."),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userRef = ref(db, `SHOPS/${currentUser.uid}`);
          await update(userRef, { image: downloadURL }); // <--- changed key to 'image'
          dispatch(updateUserSuccess({ ...currentUser, image: downloadURL }));
          setImageFileUrl(downloadURL);
          setFormData((prev) => ({ ...prev, image: downloadURL }));
        }
      );
    } catch (error) {
      setImageUploadError("Image upload error.");
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Password Change
  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const user = auth.currentUser;

      if (isGoogleUser) {
        // Google users can set password directly
        await updatePassword(user, newPassword);
        setPasswordSuccess("Password set successfully!");
      } else {
        // Verify old password for email/password users
        const credential = EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setPasswordSuccess("Password updated successfully!");
      }

      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordError(error.message || "Error updating password.");
    }
  };

  // Handle Location Detection
  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Get address from coordinates using reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Failed to get location details");
          }

          const data = await response.json();
          const formattedAddress = data.display_name || `${latitude}, ${longitude}`;
          console.log(formData);
          // Update form data with location
          setFormData(prev => ({
            ...prev,
            address: formattedAddress,
            latitude: latitude,
            longitude: longitude
          }));

          // Update the input field value
          const addressInput = document.getElementById('address');
          if (addressInput) {
            addressInput.value = formattedAddress;
          }

          setLocationLoading(false);
          setUpdateSuccess("Location detected successfully!");
        } catch (error) {
          setLocationError("Error getting location details.");
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationError(`Error: ${error.message || "Unable to retrieve your location"}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Handle Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) return;

    try {
      dispatch(updateUserStart());
      const user = auth.currentUser;

      // Update email if changed
      if (formData.email && formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update database
      // Fix: Changed from shopss to users to match other occurrences
      const userRef = ref(db, `SHOPS/${user.uid}`);
      await update(userRef, formData);

      // Update Redux store
      const updatedUser = { ...currentUser, ...formData };
      if (formData.email) updatedUser.email = formData.email;

      dispatch(updateUserSuccess(updatedUser));
      setUpdateSuccess("Profile updated successfully!");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile.");
      dispatch(updateUserFailed(error.message));
      setUpdateSuccess(null);
    }
  };

  return (
    <div className='max-w-lg p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type="file" accept='image/*' hidden onChange={handleImageChange} ref={filePickerRef} />
        <div className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          <img src={imageFileUrl} alt="User" className='rounded-full w-full h-full object-cover border-8 border-[lightgray]' />
        </div>
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        <Label htmlFor='name' value='Full Name' />
        <TextInput
          type='text'
          id='name'
          placeholder='Full Name'
          defaultValue={currentUser.name}
          onChange={handleChange}
        />

        <Label htmlFor='email' value='Email' />
        <TextInput
          type='email'
          id='email'
          placeholder='Email'
          defaultValue={currentUser.email}
          onChange={handleChange}
        />

        <Label htmlFor='number' value='Phone Number' />
        <TextInput
          type='text'
          id='phone'
          placeholder='Phone Number'
          defaultValue={currentUser.phone}
          onChange={handleChange}
        />

        <Label htmlFor='Minimum Order' value='Minimum Order' />
        <TextInput
          type='number'
          id='min'
          placeholder='Minimum Order'
          defaultValue={currentUser.min}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor='address' value='Address' />
          <div className="flex gap-2">
            <TextInput
              className="flex-1"
              type='text'
              id='address'
              placeholder='Address'
              defaultValue={currentUser.address}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className='flex self-center justify-center w-40' pill outline
              type="button"
              onClick={handleGetLocation}
              disabled={locationLoading}

            >
              {locationLoading ? "Detecting..." : "Set Location"}
            </Button>
          </div>
          {locationError && <Alert color='failure'>{locationError}</Alert>}
        </div>

        <Button className='flex self-center justify-center w-40' type='submit' pill outline >Update</Button>
        <Button type="button" className="mt-3" onClick={() => setShowPasswordModal(true)} pill outline>
          {isGoogleUser ? "Set Password" : "Change Password"}
        </Button>
      </form>

      {updateSuccess && <Alert className="mt-5" color='success'>{updateSuccess}</Alert>}
      {errorMessage && <Alert className="mt-5" color='failure'>{errorMessage}</Alert>}

      <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <Modal.Header>{isGoogleUser ? "Set Password" : "Change Password"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {passwordError && <Alert color="failure">{passwordError}</Alert>}
            {passwordSuccess && <Alert color="success">{passwordSuccess}</Alert>}

            {!isGoogleUser && (
              <TextInput
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            )}
            <TextInput
              type="password"
              placeholder={isGoogleUser ? "New Password" : "New Password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePasswordChange}>
            {isGoogleUser ? "Set Password" : "Update Password"}
          </Button>
          <Button color="gray" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DashProfile;