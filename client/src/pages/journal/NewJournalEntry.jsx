import React from 'react';
import { 
  Box, 
  Breadcrumbs,
  Typography,
  Link as MuiLink,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddIcon from '@mui/icons-material/Add';
import JournalEntryForm from '../../components/features/journal/JournalEntryForm';

const NewJournalEntry = () => {
  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink
            component={Link}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            to="/journal"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <LibraryBooksIcon sx={{ mr: 0.5 }} fontSize="small" />
            Journal Entries
          </MuiLink>
          <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
            <AddIcon sx={{ mr: 0.5 }} fontSize="small" />
            New Journal Entry
          </Typography>
        </Breadcrumbs>
      </Paper>

      <JournalEntryForm />
    </Box>
  );
};

export default NewJournalEntry; 