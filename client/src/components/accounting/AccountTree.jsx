import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const getAccountIcon = (type) => {
  switch (type) {
    case 'Asset':
      return <AccountBalanceWalletIcon fontSize="small" />;
    case 'Liability':
      return <AccountBalanceIcon fontSize="small" />;
    case 'Equity':
      return <AttachMoneyIcon fontSize="small" />;
    case 'Revenue':
      return <TrendingUpIcon fontSize="small" color="success" />;
    case 'Expense':
      return <TrendingDownIcon fontSize="small" color="error" />;
    default:
      return null;
  }
};

const AccountTree = ({
  accounts,
  onEdit,
  onDelete,
  expanded,
  onNodeToggle,
  selected,
  onNodeSelect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const buildTree = (items, parent = null) => {
    return items
      .filter(item => item.parentAccount === parent)
      .map(item => ({
        ...item,
        children: buildTree(items, item._id)
      }));
  };

  const tree = buildTree(accounts);

  const renderTreeItems = (nodes) => (
    nodes.map((node) => (
      <TreeItem
        key={node._id}
        nodeId={node._id}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.5,
              px: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderRadius: 1,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getAccountIcon(node.type)}
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: node.isSubledger ? 'normal' : 'bold',
                    color: !node.isActive ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {node.code} - {node.name}
                </Typography>
                {node.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: isMobile ? 'none' : 'block',
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {node.description}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit Account">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Account">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node._id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
      >
        {node.children.length > 0 && renderTreeItems(node.children)}
      </TreeItem>
    ))
  );

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      onNodeToggle={onNodeToggle}
      selected={selected}
      onNodeSelect={onNodeSelect}
      sx={{
        flexGrow: 1,
        maxWidth: '100%',
        overflow: 'auto',
        '& .MuiTreeItem-root': {
          '& .MuiTreeItem-content': {
            padding: '4px 0',
          },
        },
      }}
    >
      {renderTreeItems(tree)}
    </TreeView>
  );
};

export default AccountTree; 