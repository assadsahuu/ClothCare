import { Alert, Button, TextInput, Label } from 'flowbite-react';
import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { ref, update } from 'firebase/database';
import { db, storage } from '../firebase';

function AddService() {
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const filePickerRef = useRef();
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    dryclean: '',
    iron: '',
    washing: '',
    washing_And_Iron: '',

  });
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError("File must be less than 2MB");
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageUploadError(null);
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageUploadError(null);
    setLoading(true);

    try {
      const fileName = `service_images/${currentUser.uid}_${formData.serviceName}_${Date.now()}`;
      const imgRef = storageRef(storage, fileName);
      const uploadTask = uploadBytesResumable(imgRef, imageFile);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          setImageUploadError('Error uploading image. Please try again.');
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, imageUri: downloadURL });
          setLoading(false);
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const priceFields = ['dryclean', 'iron', 'washing', 'washing_And_Iron'];

    if (priceFields.includes(id)) {
      if (value === '') {
        setFormData({ ...formData, [id]: value });
        return;
      }

      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) return; // Ignore non-numeric input
      if (numberValue < 0) return; // Prevent negative numbers

      setFormData({ ...formData, [id]: value });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceName || !imageFileUrl) {
      setErrorMessage("Please enter a service name and upload an image");
      return;
    }

    // Check if at least one service type has a price
    if (!formData.dryclean && !formData.iron && !formData.washing && !formData.washing_And_Iron) {
      setErrorMessage("Please set a price for at least one service type");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setUpdateSuccess(null);

    try {
      // Format prices as numbers for non-empty fields
      const serviceData = {
        imagesUri: imageFileUrl
      };

      // Only add services with valid prices
      if (formData.dryclean) {
        const drycleanPrice = parseFloat(formData.dryclean);
        if (!isNaN(drycleanPrice)) {
          serviceData.dryclean = drycleanPrice;
        }
      }

      if (formData.iron) {
        const ironPrice = parseFloat(formData.iron);
        if (!isNaN(ironPrice)) {
          serviceData.iron = ironPrice;
        }
      }

      if (formData.washing_And_Iron) {
        const washingPrice = parseFloat(formData.washing_And_Iron);
        if (!isNaN(washingPrice)) {
          serviceData.washing_And_Iron = washingPrice;
        }
      }
      if (formData.washing) {
        const washingPrice = parseFloat(formData.washing);
        if (!isNaN(washingPrice)) {
          serviceData.washing = washingPrice;
        }
      }


      // Reference to the services node in the shop's data
      const serviceRef = ref(db, `SHOPS/${currentUser.uid}/services/${formData.serviceName}`);

      // Update the database
      await update(serviceRef, serviceData);

      setUpdateSuccess("Service added successfully!");

      // Reset form
      setFormData({
        serviceName: '',
        dryclean: '',
        iron: '',
        washing: '',
        washing_And_Iron: '',

      });
      setImageFile(null);
      setImageFileUrl(null);

    } catch (error) {
      setErrorMessage("Failed to add service: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Add New Service</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {errorMessage && <Alert color="failure">{errorMessage}</Alert>}
        {updateSuccess && <Alert color="success">{updateSuccess}</Alert>}

        <div>
          <Label htmlFor="serviceName" value="Service Name" />
          <TextInput
            type="text"
            pattern="[^0-9]*"
            id="serviceName"
            placeholder="e.g., Khameez Shalwar, Abaya, Coat"
            value={formData.serviceName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="dryclean" value="Dry Clean Price" />
            <TextInput
              type="number"
              id="dryclean"
              min={0}
              placeholder="Leave empty if not offered"
              value={formData.dryclean}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="iron" value="Iron Price" />
            <TextInput
              type="number"
              id="iron"
              min={0}
              placeholder="Leave empty if not offered"
              value={formData.iron}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="washing" value="washing Price" />
            <TextInput
              type="number"
              id="washing"
              min={0}
              placeholder="Leave empty if not offered"
              value={formData.washing}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="washing_And_Iron" value="washing_And_Iron Price" />
            <TextInput
              type="number"
              min={0}
              id="washing_And_Iron"
              placeholder="Leave empty if not offered"
              value={formData.washing_And_Iron}
              onChange={handleChange}
            />
          </div>

        </div>



        <div className="flex flex-col gap-2">
          <Label value="Service Image" />
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => filePickerRef.current.click()}
              outline
              pill
              disabled={loading}
            >
              Upload Image
            </Button>
            {imageFileUrl && (
              <div className="h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={imageFileUrl}
                  alt="Service Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={filePickerRef}
            onChange={handleImageChange}
          />
        </div>

        <Button
          type="submit"
          className="mt-4"
          pill
          outline
          disabled={loading}
        >
          {loading ? "Processing..." : "Add Service"}
        </Button>
      </form>
    </div>
  );
}

export default AddService;