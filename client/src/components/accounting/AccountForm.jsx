import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const accountTypes = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
];

const validationSchema = Yup.object({
  name: Yup.string().required('Account name is required'),
  code: Yup.string()
    .required('Account code is required')
    .matches(/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens'),
  type: Yup.string().required('Account type is required'),
  subtype: Yup.string(),
  description: Yup.string(),
  parentAccount: Yup.string().nullable(),
  isSubledger: Yup.boolean(),
  isActive: Yup.boolean(),
  tags: Yup.array().of(Yup.string()),
});

const AccountForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  accounts,
  loading,
  error,
}) => {
  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      code: '',
      type: '',
      description: '',
      subtype: '',
      parentAccount: null,
      isSubledger: false,
      isActive: true,
      tags: [],
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {initialValues ? 'Edit Account' : 'Add Account'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Account Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="code"
                name="code"
                label="Account Code"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                id="type"
                name="type"
                label="Type"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
                required
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="subtype"
                name="subtype"
                label="Subtype"
                value={formik.values.subtype}
                onChange={formik.handleChange}
                error={formik.touched.subtype && Boolean(formik.errors.subtype)}
                helperText={formik.touched.subtype && formik.errors.subtype}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                id="parentAccount"
                name="parentAccount"
                label="Parent Account"
                value={formik.values.parentAccount || ''}
                onChange={formik.handleChange}
                error={formik.touched.parentAccount && Boolean(formik.errors.parentAccount)}
                helperText={formik.touched.parentAccount && formik.errors.parentAccount}
              >
                <MenuItem value="">None</MenuItem>
                {accounts
                  .filter(acc => acc._id !== initialValues?._id)
                  .map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>
                      {acc.code} - {acc.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isSubledger}
                    onChange={formik.handleChange}
                    name="isSubledger"
                  />
                }
                label="Is Subledger"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formik.isValid || !formik.dirty}
          >
            {initialValues ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountForm; 