import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const accountTypes = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' }
];

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Account code is required')
    .matches(/^[A-Z0-9]+$/, 'Account code must contain only uppercase letters and numbers')
    .min(3, 'Account code must be at least 3 characters')
    .max(10, 'Account code must not exceed 10 characters'),
  name: Yup.string()
    .required('Account name is required')
    .min(3, 'Account name must be at least 3 characters')
    .max(100, 'Account name must not exceed 100 characters'),
  type: Yup.string()
    .required('Account type is required')
    .oneOf(['asset', 'liability', 'equity', 'revenue', 'expense'], 'Invalid account type'),
  categoryId: Yup.string()
    .required('Account category is required'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
});

const AccountForm = ({
  open,
  onClose,
  onSubmit,
  account,
  categories,
  loading
}) => {
  const formik = useFormik({
    initialValues: {
      code: account?.code || '',
      name: account?.name || '',
      type: account?.type || '',
      categoryId: account?.category?.id || '',
      description: account?.description || ''
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const filteredCategories = categories.filter(
    cat => !formik.values.type || cat.type === formik.values.type
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {account ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="code"
                name="code"
                label="Account Code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={Boolean(account)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.type && Boolean(formik.errors.type)}
              >
                <InputLabel>Account Type</InputLabel>
                <Select
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Account Type"
                  disabled={Boolean(account)}
                >
                  {accountTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Account Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              >
                <InputLabel>Account Category</InputLabel>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Account Category"
                >
                  {filteredCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.categoryId && formik.errors.categoryId && (
                  <FormHelperText>{formik.errors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid || !formik.dirty}
          >
            {account ? 'Save Changes' : 'Create Account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AccountForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  account: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    }),
    description: PropTypes.string
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  loading: PropTypes.bool
};

export default AccountForm; 