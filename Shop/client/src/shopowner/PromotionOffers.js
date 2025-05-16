import React, { useEffect, useState } from 'react';
import { Button, Label, TextInput, Alert, Modal } from 'flowbite-react';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { useSelector } from 'react-redux';

function PromotionOffers() {
  const { currentUser } = useSelector((state) => state.user);
  const shopId = currentUser?.uid;
  const [formData, setFormData] = useState({
    namep: '',
    descriptionp: '',
    percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      if (!shopId) return;
      try {
        const promotionRef = ref(db, `SHOPS/${shopId}/promotion`);
        const snapshot = await get(promotionRef);
        if (snapshot.exists()) {
          setFormData(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching promotion:", error);
      }
    };
    fetchPromotion();
  }, [shopId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'percentage'
        ? Math.min(100, Math.max(0, Number(value)))
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!formData.namep.trim() || !formData.descriptionp.trim()) {
        throw new Error('Promotion name and description are required');
      }

      if (formData.percentage <= 0 || formData.percentage > 100) {
        throw new Error('Percentage must be between 1 and 100');
      }

      const promotionData = {
        namep: formData.namep.trim(),
        descriptionp: formData.descriptionp.trim(),
        percentage: Number(formData.percentage)
      };

      const promotionRef = ref(db, `SHOPS/${shopId}/promotion`);
      await update(promotionRef, promotionData);

      setSuccessMessage('Promotion updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update promotion');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!shopId || !formData.namep) return;

    try {
      setLoading(true);
      const promotionRef = ref(db, `SHOPS/${shopId}/promotion`);
      await remove(promotionRef);

      // Reset form data and show success message
      setFormData({ namep: '', descriptionp: '', percentage: 0 });
      setSuccessMessage('Promotion deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to delete promotion');
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!shopId) return <div className="text-center text-red-600 dark:text-red-400">Please log in to manage promotions</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Promotion Management
        </h2>

      </div>


      {formData.namep && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700  border-gray-200rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {formData.namep}
            </h3>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold px-3 py-1 rounded-full">
              {formData.percentage}% OFF
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {formData.descriptionp}
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active promotion • Applied to all services
            </p>
          </div>

        </div>
      )}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0'>
        <div className='pt-4 pl-15 self-center'>
          <Button
            outline
            pill
            onClick={() => setShowModal(true)}

            className="w-full md:w-auto transition-transform hover:scale-105"
          >
            {formData.namep ? 'Edit Promotion' : 'Create Promotion'}
          </Button>

        </div>
        {formData.namep && (
          <div className='pt-4'>
            <Button
              outline
              pill
              color="failure"
              onClick={handleDelete}
              className="w-full md:w-auto transition-transform hover:scale-105"
              disabled={loading}
            >
              Delete Promotion
            </Button>
          </div>
        )}

      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} className="z-50">
        <Modal.Header className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
          {formData.namep ? 'Edit Promotion' : 'Create New Promotion'}
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-900">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && <Alert color="failure">{errorMessage}</Alert>}
            {successMessage && <Alert color="success">{successMessage}</Alert>}

            <div>
              <Label htmlFor="namep" value="Promotion Name" className="text-gray-800 dark:text-gray-200" />
              <TextInput
                id="namep"
                type="text"
                value={formData.namep}
                onChange={handleChange}
                required
                maxLength={50}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descriptionp" value="Description" className="text-gray-800 dark:text-gray-200" />
              <TextInput
                id="descriptionp"
                type="text"
                value={formData.descriptionp}
                onChange={handleChange}
                required
                maxLength={100}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="percentage" value="Discount Percentage" className="text-gray-800 dark:text-gray-200" />
              <TextInput
                id="percentage"
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={handleChange}
                required
                helperText="Enter a value between 1 and 100"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Promotion'}
              </Button>
              <Button
                color="gray"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PromotionOffers;
