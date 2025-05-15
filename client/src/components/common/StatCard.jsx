import React from 'react';
import { Card, CardContent, Typography, Box, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: color ? `${color}15` : `${theme.palette.primary.main}15`,
  marginBottom: theme.spacing(2),
}));

const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  return (
    <StyledCard>
      <CardContent>
        <IconWrapper color={color}>
          <SvgIcon
            component={icon}
            sx={{
              color: color || 'primary.main',
              fontSize: 24,
            }}
          />
        </IconWrapper>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 1,
              color: trend === 'up' ? 'success.main' : 'error.main',
            }}
          >
            <Typography variant="body2" sx={{ mr: 0.5 }}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </Typography>
            <Typography variant="body2">vs last month</Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatCard; 