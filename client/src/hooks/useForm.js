import { useState, useCallback } from 'react';

/**
 * A custom hook for handling form state and validation.
 * @param {Object} options - Configuration options
 * @param {Object} options.initialValues - The initial form values
 * @param {Object} options.validationSchema - The validation schema (Yup schema)
 * @param {Function} options.onSubmit - The submit handler function
 * @param {Function} options.onChange - The change handler function
 * @returns {Object} - The form state and handlers
 */
const useForm = ({
  initialValues = {},
  validationSchema,
  onSubmit,
  onChange
} = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(async (name, value) => {
    if (!validationSchema) return;

    try {
      await validationSchema.validateAt(name, { [name]: value });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return true;
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
      return false;
    }
  }, [validationSchema]);

  const validateForm = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(async (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({ ...prev, [name]: newValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange?.(name, newValue);
    await validateField(name, newValue);
  }, [onChange, validateField]);

  const handleBlur = useCallback(async (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    await validateField(name, value);
  }, [validateField]);

  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setIsSubmitting(true);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    try {
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateForm, values]);

  const setFieldValue = useCallback(async (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange?.(name, value);
    await validateField(name, value);
  }, [onChange, validateField]);

  const setFieldTouched = useCallback(async (name, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
    if (isTouched) {
      await validateField(name, values[name]);
    }
  }, [validateField, values]);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name]
  }), [values, touched, errors, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    getFieldProps,
    setValues,
    setErrors,
    setTouched,
    setIsSubmitting
  };
};

export default useForm; 